import { View, Text, TouchableOpacity, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Lock, Unlock, Copy, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import ActiveTimer from "./ActiveTimer";
import { Colors } from "@/constants/colors";
import type { Reservation } from "@/constants/types";
import {
  getHeroCardState,
  formatDate,
  getSlotStartDate,
} from "@/constants/types";

interface HeroCardProps {
  reservation: Reservation | null;
}

export default function HeroCard({ reservation }: HeroCardProps) {
  const router = useRouter();
  const state = getHeroCardState(reservation);

  // ── No upcoming reservation ───────────────────────────────────────────────
  if (state === "no_reservation" || !reservation) {
    return (
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 items-center gap-4">
        <View className="bg-gray-100 rounded-full p-4">
          <Text className="text-3xl">🏋️</Text>
        </View>
        <View className="items-center gap-1">
          <Text className="text-base font-semibold text-gray-900">
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
          <Text className="text-white text-sm font-semibold">
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

  // ── Upcoming (PIN hidden or visible) ─────────────────────────────────────
  const isPinVisible = state === "visible_pin";
  const { slot, pin } = reservation;
  const startDate = getSlotStartDate(slot);
  const formattedDate = formatDate(slot.date);

  async function copyPin() {
    if (pin) {
      await Clipboard.setStringAsync(pin);
      Alert.alert("Copied", "PIN copied to clipboard.");
    }
  }

  return (
    <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 gap-4">
      {/* Status badge */}
      <View className="flex-row items-center justify-between">
        <View className="bg-primary-light rounded-full px-3 py-1">
          <Text className="text-primary text-xs font-semibold uppercase tracking-wider">
            Next Session
          </Text>
        </View>
        {isPinVisible && (
          <View className="bg-green-100 rounded-full px-2 py-1">
            <Text className="text-green-700 text-[10px] font-semibold">
              Ready
            </Text>
          </View>
        )}
      </View>

      {/* Date & time */}
      <View className="gap-1">
        <Text className="text-2xl font-bold text-gray-900">{formattedDate}</Text>
        <Text className="text-base text-gray-500">
          {slot.startTime} – {slot.endTime}
        </Text>
      </View>

      {/* PIN display */}
      <View className="bg-neutral-50 rounded-2xl p-4 items-center gap-2 border border-gray-100">
        <View className="flex-row items-center gap-2 mb-1">
          {isPinVisible ? (
            <Unlock size={14} color={Colors.primary} />
          ) : (
            <Lock size={14} color={Colors.textMuted} />
          )}
          <Text className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Entry PIN
          </Text>
        </View>

        {isPinVisible && pin ? (
          <View className="items-center gap-3">
            <Text className="text-5xl font-bold text-gray-900 tracking-[0.25em]">
              {pin}
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 bg-primary-light rounded-full px-4 py-2"
              onPress={copyPin}
              activeOpacity={0.8}
            >
              <Copy size={14} color={Colors.primary} />
              <Text className="text-primary text-xs font-semibold">
                Copy PIN
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center gap-2">
            <Text className="text-5xl font-bold text-gray-300 tracking-[0.25em]">
              ••••••
            </Text>
            <Text className="text-xs text-gray-400 text-center">
              PIN revealed 30 min before your session
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
