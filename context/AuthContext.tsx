import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import {
  apiLogin,
  apiRegister,
  apiLogout,
  apiGetMe,
  apiGetProfile,
  apiUpdateMe,
  apiChangePassword,
  apiUploadAvatar,
  apiRegisterPushToken,
  getStoredTokens,
  storeTokens,
  clearTokens,
} from "@/lib/api";
import type { User } from "@/constants/types";

// ─── Push token registration (best-effort) ────────────────────────────────────

async function registerPushToken(): Promise<void> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    // getExpoPushTokenAsync reads projectId from app.json automatically in managed workflow
    const tokenData = await Notifications.getExpoPushTokenAsync();
    await apiRegisterPushToken(
      tokenData.data,
      Platform.OS === "android" ? "android" : "ios"
    );
  } catch {
    // Best-effort — never block login on push token failure (Expo Go, simulator)
  }
}

const FACE_ID_KEY = "drfit_faceid_enabled";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isFaceIDEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithBiometrics: () => Promise<boolean>;
  logout: () => Promise<void>;
  enableFaceID: () => Promise<boolean>;
  disableFaceID: () => Promise<void>;
  authenticateWithFaceID: () => Promise<boolean>;
  updateProfile: (fields: { name?: string; email?: string; dateOfBirth?: string | null }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(false);

  // Restore session on cold start
  useEffect(() => {
    async function restore() {
      try {
        const { accessToken } = await getStoredTokens();
        const faceIDPref = await SecureStore.getItemAsync(FACE_ID_KEY);
        if (accessToken) {
          setToken(accessToken);
          const me = await apiGetMe();
          const profile = await apiGetProfile();
          setUser({ ...me, ...profile });
          registerPushToken();
        }
        setIsFaceIDEnabled(faceIDPref === "true");
      } catch {
        await clearTokens();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    await storeTokens(data.accessToken, data.refreshToken);
    setToken(data.accessToken);
    const profile = await apiGetProfile();
    setUser({ ...data.user, ...profile });
    registerPushToken();
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    await storeTokens(data.accessToken, data.refreshToken);
    setToken(data.accessToken);
    const profile = await apiGetProfile();
    setUser({ ...data.user, ...profile });
    registerPushToken();
  }, []);

  const logout = useCallback(async () => {
    try {
      const { refreshToken } = await getStoredTokens();
      if (refreshToken) await apiLogout(refreshToken);
    } catch {
      // Best-effort — clear local state regardless
    } finally {
      await clearTokens();
      setToken(null);
      setUser(null);
    }
  }, []);

  const enableFaceID = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        await SecureStore.setItemAsync(FACE_ID_KEY, "true");
        setIsFaceIDEnabled(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const disableFaceID = useCallback(async () => {
    await SecureStore.setItemAsync(FACE_ID_KEY, "false");
    setIsFaceIDEnabled(false);
  }, []);

  const authenticateWithFaceID = useCallback(async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to DrFit",
        disableDeviceFallback: false,
        cancelLabel: "Use Password",
      });
      return result.success;
    } catch {
      return false;
    }
  }, []);

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      const success = await authenticateWithFaceID();
      if (!success) return false;
      const { accessToken } = await getStoredTokens();
      if (!accessToken) return false;
      setToken(accessToken);
      const me = await apiGetMe();
      setUser(me);
      registerPushToken();
      return true;
    } catch {
      return false;
    }
  }, [authenticateWithFaceID]);

  const updateProfile = useCallback(async (fields: {
    name?: string;
    email?: string;
    dateOfBirth?: string | null;
  }) => {
    await apiUpdateMe(fields);
    // Refetch to get authoritative state from backend
    const fresh = await apiGetMe();
    setUser(fresh);
  }, []);

  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ) => {
    await apiChangePassword(currentPassword, newPassword);
  }, []);

  const uploadAvatar = useCallback(async (imageUri: string) => {
    const updated = await apiUploadAvatar(imageUri);
    setUser((prev) => prev ? { ...prev, ...updated } : updated);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isFaceIDEnabled,
        login,
        register,
        loginWithBiometrics,
        logout,
        enableFaceID,
        disableFaceID,
        authenticateWithFaceID,
        updateProfile,
        changePassword,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
