import { useState, useEffect, useCallback } from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import type { Reservation } from "@/constants/types";
import { getSlotStartDate, getSlotEndDate } from "@/constants/types";

interface ActiveTimerProps {
  reservation: Reservation;
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

export default function ActiveTimer({ reservation }: ActiveTimerProps) {
  const start = getSlotStartDate(reservation.slot);
  const end = getSlotEndDate(reservation.slot);
  const totalMs = end.getTime() - start.getTime();

  const getRemainingMs = useCallback(
    () => Math.max(0, end.getTime() - Date.now()),
    [end]
  );

  const [remainingMs, setRemainingMs] = useState(getRemainingMs);

  useEffect(() => {
    const interval = setInterval(() => {
      const ms = getRemainingMs();
      setRemainingMs(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [getRemainingMs]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = 1 - remainingMs / totalMs;

  const timeLabel = `${padTwo(minutes)}:${padTwo(seconds)}`;

  return (
    <View className="bg-white rounded-2xl p-5 gap-4 border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <View className="bg-primary rounded-full px-3 py-1">
          <Text className="text-black text-xs font-semibold uppercase tracking-wider">
            Session in progress
          </Text>
        </View>
      </View>

      {/* Countdown */}
      <View className="items-center gap-1">
        <Text className="font-unbounded text-black" style={{ fontSize: 56, lineHeight: 64 }}>
          {timeLabel}
        </Text>
        <Text className="text-sm text-gray-500">remaining</Text>
      </View>

      {/* Progress bar */}
      <View className="gap-2">
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-primary rounded-full"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">
            {reservation.slot.startTime}
          </Text>
          <Text className="text-xs text-gray-400">
            {reservation.slot.endTime}
          </Text>
        </View>
      </View>
    </View>
  );
}
