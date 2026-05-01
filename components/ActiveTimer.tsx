import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Eye, MapPin } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { apiGetReservationPin } from "@/lib/api";
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
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

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

  async function handleShowPin() {
    let pin = fetchedPin;
    // Fake dev reservation — backend has no record of it, use embedded pin
    if (!pin && reservation.id.startsWith("dev-fake")) {
      pin = reservation.pin ?? null;
    }
    if (!pin) {
      setIsFetchingPin(true);
      try {
        const data = await apiGetReservationPin(reservation.id);
        pin = data.pin;
        setFetchedPin(pin);
      } catch (err) {
        console.log("[ActiveTimer] PIN fetch failed:", err);
        Alert.alert("PIN unavailable", "Could not fetch the PIN. Please try again.");
        setIsFetchingPin(false);
        return;
      }
      setIsFetchingPin(false);
    }
    Alert.alert("Entry PIN", pin, [
      {
        text: "Copy",
        onPress: async () => {
          await Clipboard.setStringAsync(pin!);
        },
      },
      { text: "Done", style: "cancel" },
    ]);
  }

  return (
    <View className="bg-white rounded-2xl p-5 gap-4 border border-gray-100">
      {/* Header — status badge + center location */}
      <View className="flex-row items-center justify-between">
        <View className="bg-primary rounded-full px-3 py-1">
          <Text className="text-black text-xs font-semibold uppercase tracking-wider">
            Session in progress
          </Text>
        </View>
        <View className="flex-row items-center gap-1 flex-shrink">
          <MapPin size={12} color={Colors.textSecondary} />
          <Text
            className="text-xs font-medium text-gray-600"
            numberOfLines={1}
          >
            {reservation.centerName || "DrFit Center"}
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

      {/* Show PIN button */}
      <TouchableOpacity
        className="flex-row items-center justify-center gap-2 bg-black rounded-2xl py-4"
        onPress={handleShowPin}
        activeOpacity={0.85}
        disabled={isFetchingPin}
      >
        {isFetchingPin ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Eye size={16} color="#fff" />
            <Text className="text-sm font-semibold text-white">Show PIN</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
