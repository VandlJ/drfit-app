import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { MOCK_USER, DEMO_EMAIL, DEMO_PASSWORD } from "@/constants/mock";
import type { User } from "@/constants/types";

const JWT_KEY = "drfit_jwt";
const FACE_ID_KEY = "drfit_faceid_enabled";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isFaceIDEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableFaceID: () => Promise<void>;
  disableFaceID: () => Promise<void>;
  authenticateWithFaceID: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFaceIDEnabled, setIsFaceIDEnabled] = useState(false);

  // Restore session from SecureStore on app launch
  useEffect(() => {
    async function restore() {
      try {
        const storedToken = await SecureStore.getItemAsync(JWT_KEY);
        const faceIDPref = await SecureStore.getItemAsync(FACE_ID_KEY);
        if (storedToken) {
          // In production: validate token with GET /auth/me
          // For now: assume token is valid and restore mock user
          setToken(storedToken);
          setUser(MOCK_USER);
        }
        setIsFaceIDEnabled(faceIDPref === "true");
      } catch {
        // SecureStore not available (e.g. Expo Go without dev build)
      } finally {
        setIsLoading(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Mock auth — replace with POST /auth/login when backend is ready
    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      throw new Error("Invalid email or password.");
    }
    const mockToken = "mock-jwt-token-" + Date.now();
    await SecureStore.setItemAsync(JWT_KEY, mockToken);
    setToken(mockToken);
    setUser(MOCK_USER);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(JWT_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const enableFaceID = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (hasHardware && isEnrolled) {
        await SecureStore.setItemAsync(FACE_ID_KEY, "true");
        setIsFaceIDEnabled(true);
      }
    } catch {
      // Not available in Expo Go — silently skip
    }
  }, []);

  const disableFaceID = useCallback(async () => {
    await SecureStore.setItemAsync(FACE_ID_KEY, "false");
    setIsFaceIDEnabled(false);
  }, []);

  const authenticateWithFaceID = useCallback(async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) return false;

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

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isFaceIDEnabled,
        login,
        logout,
        enableFaceID,
        disableFaceID,
        authenticateWithFaceID,
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
