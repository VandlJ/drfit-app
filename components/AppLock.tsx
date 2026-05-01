// App-wide Face ID lock. Renders a full-screen overlay that blocks all
// content until the user authenticates. Triggered on:
//   - Cold start (when user is logged in AND Face ID is enabled in Settings)
//   - Returning to foreground after >= GRACE_MS in background
//
// Tapping the overlay (or the unlock button) re-prompts Face ID.
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Lock } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

const GRACE_MS = 30_000; // require re-auth after 30s in background

export function AppLock({ children }: { children: React.ReactNode }) {
  const { token, isFaceIDEnabled, authenticateWithFaceID } = useAuth();
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef<number | null>(null);
  const promptInFlight = useRef(false);
  const didColdStart = useRef(false);

  const armed = !!token && isFaceIDEnabled;

  const tryUnlock = useCallback(async () => {
    if (promptInFlight.current) return;
    promptInFlight.current = true;
    try {
      const ok = await authenticateWithFaceID();
      if (ok) setLocked(false);
    } finally {
      promptInFlight.current = false;
    }
  }, [authenticateWithFaceID]);

  // Cold start: lock immediately (if armed) and prompt
  useEffect(() => {
    if (!armed || didColdStart.current) return;
    didColdStart.current = true;
    setLocked(true);
    tryUnlock();
  }, [armed, tryUnlock]);

  // Background/foreground tracking
  useEffect(() => {
    if (!armed) return;
    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "background" || state === "inactive") {
        if (backgroundedAt.current == null) {
          backgroundedAt.current = Date.now();
        }
      } else if (state === "active") {
        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since != null && Date.now() - since >= GRACE_MS) {
          setLocked(true);
          tryUnlock();
        }
      }
    });
    return () => sub.remove();
  }, [armed, tryUnlock]);

  // If user disables Face ID or logs out, drop the lock.
  useEffect(() => {
    if (!armed && locked) setLocked(false);
  }, [armed, locked]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {locked && (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <LinearGradient
            colors={[Colors.primaryLight, Colors.primary]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          <View className="items-center gap-6 px-8">
            <View className="w-24 h-24 rounded-full bg-black items-center justify-center">
              <Lock size={40} color={Colors.primary} />
            </View>
            <Text
              className="text-3xl text-black text-center"
              style={{ fontFamily: "Unbounded_700Bold" }}
            >
              DrFit Locked
            </Text>
            <Text className="text-base text-black/70 text-center">
              Authenticate with Face ID to continue.
            </Text>
            <Pressable
              onPress={tryUnlock}
              className="bg-black rounded-full px-8 py-4 mt-4 active:opacity-80"
            >
              <Text
                className="text-white text-base"
                style={{ fontFamily: "Unbounded_500Medium" }}
              >
                Unlock with Face ID
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
