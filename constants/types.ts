// Shared TypeScript types for the DrFit app.
// API status values come back in UPPERCASE from the backend; we normalise to
// lowercase snake_case for internal use throughout the app.

export interface User {
  id: string;
  email: string;
  name: string;
  role: "client" | "admin";
  createdAt?: string;
  defaultCenter?: { id: string; name: string } | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
}

export interface Center {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface Slot {
  id: string;
  centerId: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
  priceCredits: number;
  isAvailable: boolean;
}

export type ReservationStatus = "active" | "completed" | "cancelled";

export interface Reservation {
  id: string;
  slot: Slot;
  centerId: string;
  centerName: string;
  centerAddress: string;
  status: ReservationStatus;
  pin: string | null;
  creditsSpent: number;
  createdAt: string;
}

export type TransactionType = "topup" | "spend" | "refund" | "bonus";

export interface CreditTransaction {
  id: string;
  amount: number;       // positive = credit, negative = debit
  type: TransactionType;
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export interface CreditPackage {
  id: "starter" | "standard" | "premium" | "pro";
  label: string;
  priceKc: number;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  highlight: boolean;
}

// ─── Status normalisation helpers ─────────────────────────────────────────────

export function normaliseStatus(
  apiStatus: "ACTIVE" | "COMPLETED" | "CANCELLED" | string
): ReservationStatus {
  switch (apiStatus.toUpperCase()) {
    case "ACTIVE":    return "active";
    case "COMPLETED": return "completed";
    case "CANCELLED": return "cancelled";
    default:          return "active";
  }
}

export function normaliseTransactionType(
  apiType: "TOPUP" | "SPEND" | "REFUND" | "BONUS" | string
): TransactionType {
  return apiType.toLowerCase() as TransactionType;
}

// ─── PIN / Timer helpers ──────────────────────────────────────────────────────

export type HeroCardState =
  | "no_reservation"
  | "hidden_pin"
  | "visible_pin"
  | "active_timer";

export function getSlotStartDate(slot: Slot): Date {
  const [h, m] = slot.startTime.split(":").map(Number);
  const d = new Date(slot.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getSlotEndDate(slot: Slot): Date {
  const [h, m] = slot.endTime.split(":").map(Number);
  const d = new Date(slot.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getHeroCardState(reservation: Reservation | null): HeroCardState {
  if (!reservation) return "no_reservation";

  const now = new Date();
  const start = getSlotStartDate(reservation.slot);
  const end = getSlotEndDate(reservation.slot);
  const diffMs = start.getTime() - now.getTime();

  if (now >= start && now < end) return "active_timer";
  if (diffMs > 0 && diffMs <= 30 * 60 * 1000) return "visible_pin";
  if (diffMs > 30 * 60 * 1000) return "hidden_pin";
  return "no_reservation";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr; // already "HH:mm"
}
