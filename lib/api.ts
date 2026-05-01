/**
 * DrFit API client
 * Base: https://drfit.api.hacktrack.fun
 *
 * Access tokens expire in 15 min. The client auto-refreshes via
 * /auth/refresh before retrying a failed 401.
 */

import * as SecureStore from "expo-secure-store";

export const API_BASE = "https://drfit.api.hacktrack.fun";

const ACCESS_TOKEN_KEY = "drfit_access_token";
const REFRESH_TOKEN_KEY = "drfit_refresh_token";

// ─── Token storage helpers ────────────────────────────────────────────────────

export async function getStoredTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    return { accessToken, refreshToken };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

export async function storeTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

// ─── Core fetch wrapper with auto-refresh ────────────────────────────────────

let isRefreshing = false;
let refreshListeners: Array<(token: string | null) => void> = [];

function notifyRefreshListeners(token: string | null) {
  refreshListeners.forEach((cb) => cb(token));
  refreshListeners = [];
}

async function attemptRefresh(): Promise<string | null> {
  const { refreshToken } = await getStoredTokens();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    await storeTokens(data.accessToken, data.refreshToken ?? refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const { accessToken } = await getStoredTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    // Token expired — refresh once, then retry
    if (isRefreshing) {
      // Another call is already refreshing; wait for it
      const newToken = await new Promise<string | null>((resolve) => {
        refreshListeners.push(resolve);
      });
      if (!newToken) throw new ApiError(401, "Session expired. Please sign in again.");
      return apiFetch<T>(path, options, false);
    }

    isRefreshing = true;
    const newToken = await attemptRefresh();
    isRefreshing = false;
    notifyRefreshListeners(newToken);

    if (!newToken) throw new ApiError(401, "Session expired. Please sign in again.");
    return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.error) message = body.error;
    } catch {}
    throw new ApiError(res.status, message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: "client" | "admin";
  createdAt?: string;
  defaultCenter?: { id: string; name: string } | null;
  dateOfBirth?: string | null;
  avatarUrl?: string | null;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiLogout(refreshToken: string): Promise<void> {
  await apiFetch("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function apiGetMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/auth/me");
}

/** GET /me — full profile including avatarUrl and dateOfBirth. Response: { user: ApiUser } */
export async function apiGetProfile(): Promise<Partial<ApiUser>> {
  try {
    const res = await apiFetch<{ user: ApiUser }>("/me");
    return res.user ?? {};
  } catch {
    return {};
  }
}

export async function apiUpdateMe(fields: {
  name?: string;
  email?: string;
  defaultCenterId?: string | null;
  dateOfBirth?: string | null;
}): Promise<ApiUser> {
  const res = await apiFetch<{ user: ApiUser }>("/me", {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
  return res.user ?? (res as unknown as ApiUser);
}

export async function apiChangePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await apiFetch("/me/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function apiUploadAvatar(imageUri: string): Promise<ApiUser> {
  const { accessToken } = await getStoredTokens();
  const formData = new FormData();
  // Field name must be "file" per API spec (POST /me/avatar)
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "avatar.jpg",
  } as any);

  const res = await fetch(`${API_BASE}/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      // Do NOT set Content-Type — let fetch set multipart boundary automatically
    },
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {}
    throw new ApiError(res.status, message);
  }
  const json = await res.json();
  // Response: { user: ApiUser }
  return json.user ?? json;
}

// ─── Centers ─────────────────────────────────────────────────────────────────

export interface ApiCenter {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
}

export async function apiGetCenters(): Promise<ApiCenter[]> {
  const data = await apiFetch<{ centers: ApiCenter[] }>("/centers");
  return data.centers;
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export interface ApiSlot {
  id: string;
  centerId: string;
  date: string;        // "YYYY-MM-DD"
  startTime: string;   // "HH:mm"
  endTime: string;     // "HH:mm"
  priceCredits: number;
  isAvailable: boolean;
}

export async function apiGetSlots(
  date: string,
  centerId: string
): Promise<ApiSlot[]> {
  const data = await apiFetch<{ slots: ApiSlot[] }>(
    `/slots?date=${date}&centerId=${centerId}`
  );
  return data.slots;
}

// ─── Reservations ─────────────────────────────────────────────────────────────

export interface ApiReservation {
  id: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  creditsSpent: number;
  createdAt: string;
  pin?: string | null;
  slot: ApiSlot & { center?: { id: string; name: string; address: string } };
}

export async function apiGetReservations(): Promise<ApiReservation[]> {
  const data = await apiFetch<{ reservations: ApiReservation[] }>("/reservations");
  return data.reservations;
}

export async function apiCreateReservation(slotId: string): Promise<ApiReservation> {
  return apiFetch<ApiReservation>("/reservations", {
    method: "POST",
    body: JSON.stringify({ slotId }),
  });
}

export async function apiCancelReservation(id: string): Promise<void> {
  await apiFetch(`/reservations/${id}`, { method: "DELETE" });
}

export async function apiGetReservationPin(
  id: string
): Promise<{ pin: string }> {
  return apiFetch<{ pin: string }>(`/reservations/${id}/pin`);
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export interface ApiTransaction {
  id: string;
  amount: number;
  type: "TOPUP" | "SPEND" | "REFUND" | "BONUS";
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export async function apiGetCreditBalance(): Promise<number> {
  const data = await apiFetch<{ balance: number }>("/credits/balance");
  return data.balance;
}

export async function apiGetCreditHistory(
  limit = 20,
  offset = 0
): Promise<ApiTransaction[]> {
  const data = await apiFetch<{ transactions: ApiTransaction[] }>(
    `/credits/history?limit=${limit}&offset=${offset}`
  );
  return data.transactions;
}

export async function apiCreateTopupIntent(
  packageId: "starter" | "standard" | "premium" | "pro"
): Promise<{ clientSecret: string; amount: number }> {
  return apiFetch<{ clientSecret: string; amount: number }>("/credits/topup", {
    method: "POST",
    body: JSON.stringify({ packageId }),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function apiRegisterPushToken(
  token: string,
  platform: "ios" | "android" = "ios"
): Promise<void> {
  await apiFetch("/notifications/token", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  });
}

export async function apiRemovePushToken(token: string): Promise<void> {
  await apiFetch("/notifications/token", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}

// ─── Feedback ─────────────────────────────────────────────────────────────────

export async function apiSubmitFeedback(payload: {
  rating: number;
  comment?: string;
  reservationId?: string;
}): Promise<void> {
  await apiFetch("/feedback", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
