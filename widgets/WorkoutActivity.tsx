// Live Activity for an in-progress DrFit workout session.
// Renders on the Lock Screen and in the Dynamic Island on iPhone 14 Pro+.
//
// IMPORTANT: This component runs inside a separate JavaScriptCore context in
// the widget extension process. Module-level constants and external imports
// are NOT available at runtime — only literals and the symbols injected by
// the @expo/ui widget bundle. Always inline values inside the function body.

import { HStack, Image, ProgressView, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  labelsHidden,
  lineLimit,
  monospacedDigit,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { createLiveActivity } from "expo-widgets";
import type { LiveActivityEnvironment } from "expo-widgets/build/Widgets.types";

export type WorkoutActivityProps = {
  centerName: string;
  startDateMs: number;
  endDateMs: number;
};

const WorkoutActivity = (
  props: WorkoutActivityProps,
  _env: LiveActivityEnvironment
) => {
  "widget";

  // ⚠️ Inline literals only — module-level constants are not accessible here.
  // DrFit lime green (matches `primary` in tailwind.config.js).
  const PRIMARY = "#C8EF2F";
  const TEXT = "#FFFFFF";
  const MUTED = "#9CA3AF";

  const range = {
    lower: new Date(props.startDateMs),
    upper: new Date(props.endDateMs),
  };

  // Static end-of-workout label for the compact Dynamic Island slot.
  // Using a fixed "until HH:MM" string keeps the island narrow and avoids
  // SwiftUI compact slot caching issues with `Date.now()`-based labels.
  const endDate = new Date(props.endDateMs);
  const endHour = endDate.getHours();
  const endMinute = endDate.getMinutes();
  const endLabel = `${endHour}:${endMinute < 10 ? "0" + endMinute : endMinute}`;

  return {
    // ─── Lock Screen banner ───────────────────────────────────────────────
    banner: (
      <HStack spacing={12} alignment="center" modifiers={[padding({ all: 16 })]}>
        <Image
          systemName="figure.run"
          modifiers={[
            font({ size: 22, weight: "bold" }),
            foregroundStyle(PRIMARY),
          ]}
        />
        <VStack alignment="leading" spacing={2}>
          <Text
            modifiers={[
              font({ weight: "semibold", size: 13 }),
              foregroundStyle(MUTED),
              lineLimit(1),
            ]}
          >
            DrFit · {props.centerName}
          </Text>
          <Text
            timerInterval={range}
            countsDown={true}
            modifiers={[
              font({ weight: "bold", size: 32 }),
              foregroundStyle(TEXT),
              monospacedDigit(),
            ]}
          />
          <ProgressView
            timerInterval={range}
            countsDown={true}
            modifiers={[tint(PRIMARY), labelsHidden(), padding({ top: 4 })]}
          />
        </VStack>
        <Spacer />
      </HStack>
    ),

    // ─── Dynamic Island compact ───────────────────────────────────────────
    compactLeading: (
      <Image
        systemName="figure.run"
        modifiers={[
          font({ size: 12 }),
          foregroundStyle(PRIMARY),
          padding({ leading: 4 }),
        ]}
      />
    ),
    compactTrailing: (
      <Text
        modifiers={[
          font({ weight: "medium", size: 13 }),
          foregroundStyle(PRIMARY),
        ]}
      >
        {endLabel}
      </Text>
    ),

    // ─── Dynamic Island minimal ───────────────────────────────────────────
    minimal: (
      <Image systemName="figure.run" modifiers={[foregroundStyle(PRIMARY)]} />
    ),

    // ─── Dynamic Island expanded ──────────────────────────────────────────
    expandedLeading: (
      <HStack
        spacing={8}
        alignment="center"
        modifiers={[padding({ leading: 8 })]}
      >
        <Image
          systemName="figure.run"
          modifiers={[
            font({ size: 18, weight: "bold" }),
            foregroundStyle(PRIMARY),
          ]}
        />
        <VStack alignment="leading" spacing={0}>
          <Text
            modifiers={[
              font({ weight: "semibold", size: 13 }),
              foregroundStyle(TEXT),
            ]}
          >
            Workout
          </Text>
          <Text
            modifiers={[
              font({ size: 11 }),
              foregroundStyle(MUTED),
              lineLimit(1),
            ]}
          >
            {props.centerName}
          </Text>
        </VStack>
      </HStack>
    ),
    expandedTrailing: (
      <VStack
        alignment="leading"
        spacing={2}
        modifiers={[padding({ trailing: 8 })]}
      >
        <Text
          timerInterval={range}
          countsDown={true}
          modifiers={[
            font({ weight: "bold", size: 22 }),
            foregroundStyle(PRIMARY),
            monospacedDigit(),
          ]}
        />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(MUTED)]}>
          remaining
        </Text>
      </VStack>
    ),
    expandedBottom: (
      <ProgressView
        timerInterval={range}
        countsDown={true}
        modifiers={[
          tint(PRIMARY),
          labelsHidden(),
          padding({ horizontal: 12, top: 4, bottom: 4 }),
        ]}
      />
    ),
  };
};

export default createLiveActivity("WorkoutActivity", WorkoutActivity);
