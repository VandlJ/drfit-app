import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Lock, Unlock, Copy, Dumbbell, MapPin } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import ActiveTimer from "./ActiveTimer";
import { Colors } from "@/constants/colors";
import { apiGetReservationPin } from "@/lib/api";
import type { Reservation } from "@/constants/types";
import { getHeroCardState, formatDate } from "@/constants/types";

interface HeroCardProps {
  reservation: Reservation | null;
}

export default function HeroCard({ reservation }: HeroCardProps) {
  const router = useRouter();
  const state = getHeroCardState(reservation);
  const [pinRevealed, setPinRevealed] = useState(false);
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  // Auto-hide PIN when user navigates away from this tab
  useFocusEffect(
    useCallback(() => {
      return () => {
        setPinRevealed(false);
      };
    }, [])
  );

  // ── No upcoming reservation ───────────────────────────────────────────────
  if (state === "no_reservation" || !reservation) {
    return (
      <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center gap-4">
        <View className="bg-neutral-100 rounded-full p-4">
          <Dumbbell size={36} color={Colors.textMuted} strokeWidth={1.5} />
        </View>
        <View className="items-center gap-1">
          <Text className="text-base font-semibold text-black">
            No upcoming sessions
          </Text>
          <Text className="text-sm text-gray-500 text-center">
            Book your next training to get started.
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-full px-6 py-3"
          onPress={() => router.push("/(tabs)/booking")}
          activeOpacity={0.85}
        >
          <Text className="text-black text-sm font-semibold">
            Book a Session
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Active timer ──────────────────────────────────────────────────────────
  if (state === "active_timer") {
    return <ActiveTimer reservation={reservation} />;
  }

  // ── Upcoming — PIN hidden until user taps Reveal ──────────────────────────
  const { slot, centerName, centerAddress } = reservation;
  const pin = fetchedPin ?? reservation.pin;

  async function handleReveal() {
    if (pin) {
      setPinRevealed(true);
      return;
    }
    // PIN not in cache yet — fetch from API
    setIsFetchingPin(true);
    try {
      const data = await apiGetReservationPin(reservation!.id);
      setFetchedPin(data.pin);
      setPinRevealed(true);
    } catch {
      Alert.alert("PIN unavailable", "Your PIN will be available closer to the session.");
    } finally {
      setIsFetchingPin(false);
    }
  }

  async function copyPin() {
    if (pin) {
      await Clipboard.setStringAsync(pin);
      Alert.alert("Copied", "PIN copied to clipboard.");
    }
  }

  return (
    <View className="bg-white rounded-2xl p-5 border border-gray-100 gap-4">
      {/* Status badge */}
      <View className="flex-row items-center justify-between">
        <View className="bg-primary rounded-full px-3 py-1">
          <Text className="text-black text-xs font-semibold uppercase tracking-wider">
            Next Session
          </Text>
        </View>
      </View>

      {/* Date & time */}
      <View className="gap-1">
        <Text className="font-unbounded text-black" style={{ fontSize: 22 }}>
          {formatDate(slot.date)}
        </Text>
        <Text className="text-base text-gray-500">
          {slot.startTime} – {slot.endTime}
        </Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <MapPin size={11} color={Colors.textMuted} />
          <Text className="text-xs text-gray-400">{centerName}</Text>
        </View>
      </View>

      {/* PIN display */}
      <TouchableOpacity
        className="bg-neutral-50 rounded-2xl p-4 items-center gap-2 border border-gray-100"
        onPress={pinRevealed ? () => setPinRevealed(false) : handleReveal}
        activeOpacity={0.7}
        disabled={isFetchingPin}
      >
        <View className="flex-row items-center gap-2 mb-1">
          {pinRevealed ? (
            <Unlock size={14} color={Colors.textSecondary} />
          ) : (
            <Lock size={14} color={Colors.textMuted} />
          )}
          <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Entry PIN
          </Text>
        </View>

        {pinRevealed && pin ? (
          <View className="items-center gap-3">
            <Text className="text-5xl font-bold text-black tracking-[0.25em]">
              {pin}
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-primary rounded-full px-4 py-2"
              onPress={copyPin}
              activeOpacity={0.8}
            >
              <Copy size={14} color={Colors.textPrimary} />
              <Text className="text-black text-xs font-semibold">Copy PIN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center gap-1.5">
            {isFetchingPin ? (
              <ActivityIndicator size="large" color={Colors.textMuted} />
            ) : (
              <Text className="text-5xl font-bold text-gray-300 tracking-[0.25em]">
                ••••••
              </Text>
            )}
            <Text className="text-xs text-gray-400">Tap to reveal</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
