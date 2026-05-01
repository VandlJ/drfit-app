// Hook that wires DrFit reservations to iOS Live Activity + Lock Screen widget.
//
// Behaviour:
//   - When a reservation enters the "active_timer" window, start a Live Activity.
//   - When that reservation ends (status changes / time passes / cancelled),
//     end the Live Activity.
//   - In parallel, mirror state to the Lock Screen widget (active session
//     countdown, or the next upcoming session).
//
// The hook is iOS-only and silently no-ops on Android. expo-widgets is also
// unavailable in Expo Go — we wrap calls in try/catch so the JS bridge does
// not crash the app on unsupported runtimes.

import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import {
  getHeroCardState,
  getSlotEndDate,
  getSlotStartDate,
} from "@/constants/types";
import type { Reservation } from "@/constants/types";

// Lazily access the widgets module so the app does not crash when running in
// Expo Go (where the native module is missing).
type LiveActivityInstance = {
  update: (props: unknown) => Promise<void>;
  end: (
    policy?: unknown,
    props?: unknown,
    contentDate?: Date
  ) => Promise<void>;
};

let WorkoutActivity:
  | { start: (props: any, url?: string) => LiveActivityInstance }
  | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  WorkoutActivity = require("@/widgets/WorkoutActivity").default;
  console.log("[LiveActivity] Module loaded:", !!WorkoutActivity);
} catch (e) {
  // Native module unavailable (Expo Go, Android) — gracefully degrade.
  console.warn("[LiveActivity] Failed to load module:", e);
}

const WIDGETS_SUPPORTED = Platform.OS === "ios" && WorkoutActivity != null;

function findActiveReservation(reservations: Reservation[]): Reservation | null {
  return (
    reservations.find(
      (r) => r.status === "active" && getHeroCardState(r) === "active_timer"
    ) ?? null
  );
}

export function useWorkoutLiveActivity(reservations: Reservation[]) {
  const activeInstance = useRef<LiveActivityInstance | null>(null);
  const activeReservationId = useRef<string | null>(null);
  const activeProps = useRef<Record<string, unknown> | null>(null);
  const lastRefreshAt = useRef<number>(0);

  // Re-evaluate every time reservations change AND on a 1s tick so that
  // the active window detection picks up time progression even when the
  // reservations array hasn't changed reference-wise.
  useEffect(() => {
    if (!WIDGETS_SUPPORTED) return;

    const tick = () => {
      const active = findActiveReservation(reservations);

      // ── Live Activity sync ────────────────────────────────────────────
      if (active && activeReservationId.current !== active.id) {
        // Start a new live activity (end any stale one first)
        console.log("[LiveActivity] Starting for reservation:", active.id);
        try {
          activeInstance.current?.end("immediate");
        } catch {}
        try {
          const start = getSlotStartDate(active.slot);
          const end = getSlotEndDate(active.slot);
          const startProps = {
            centerName: active.centerName,
            startDateMs: start.getTime(),
            endDateMs: end.getTime(),
          };
          activeInstance.current = WorkoutActivity!.start(
            startProps,
            `drfit://reservation/${active.id}`
          );
          activeReservationId.current = active.id;
          activeProps.current = startProps;
          lastRefreshAt.current = Date.now();
          console.log("[LiveActivity] Started OK");
        } catch (e) {
          console.warn("[LiveActivity] failed to start:", e);
        }
      } else if (!active && activeReservationId.current) {
        // End the live activity
        try {
          activeInstance.current?.end("default");
        } catch {}
        activeInstance.current = null;
        activeReservationId.current = null;
        activeProps.current = null;
      } else if (active && activeInstance.current && activeProps.current) {
        // Periodically refresh the activity so SwiftUI re-renders the
        // compact Dynamic Island slot (which uses a static `Date.now()`-based
        // label rather than `timerInterval`). 30s gives roughly minute-level
        // accuracy without burning the system update budget.
        if (Date.now() - lastRefreshAt.current >= 30_000) {
          try {
            // iOS skips updates when ContentState equality matches, so we
            // bump a `_tick` field to force a re-render every cycle.
            activeInstance.current.update({
              ...activeProps.current,
              _tick: Date.now(),
            });
            lastRefreshAt.current = Date.now();
            console.log("[LiveActivity] Refreshed");
          } catch (e) {
            console.warn("[LiveActivity] refresh failed:", e);
          }
        }
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [reservations]);

  // Cleanup on unmount (e.g. logout)
  useEffect(() => {
    return () => {
      if (!WIDGETS_SUPPORTED) return;
      try {
        activeInstance.current?.end("immediate");
      } catch {}
      activeInstance.current = null;
      activeReservationId.current = null;
    };
  }, []);
}
