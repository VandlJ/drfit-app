import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Eye, Dumbbell, MapPin, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import ActiveTimer from "./ActiveTimer";
import { Colors } from "@/constants/colors";
import { apiGetReservationPin } from "@/lib/api";
import type { Reservation } from "@/constants/types";
import { getHeroCardState, formatDate } from "@/constants/types";

interface HeroCardProps {
  reservation: Reservation | null;
  onDetailsPress?: () => void;
}

export default function HeroCard({ reservation, onDetailsPress }: HeroCardProps) {
  const router = useRouter();
  const state = getHeroCardState(reservation);
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

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

  // ── Upcoming — Show PIN button fetches from backend on demand ─────────────
  const { slot, centerName } = reservation;

  async function handleShowPin() {
    let pin = fetchedPin;
    // Fake dev reservation — backend doesn't know it, use embedded pin
    if (!pin && reservation!.id.startsWith("dev-fake")) {
      pin = reservation!.pin ?? null;
    }
    if (!pin) {
      setIsFetchingPin(true);
      try {
        const data = await apiGetReservationPin(reservation!.id);
        pin = data.pin;
        setFetchedPin(pin);
      } catch (err) {
        console.log("[HeroCard] PIN fetch failed:", err);
        Alert.alert("PIN unavailable", "Your PIN will be available closer to the session.");
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
    <View className="bg-white rounded-2xl p-5 border border-gray-100 gap-4">
      {/* Status badge */}
      <View className="flex-row items-center justify-between">
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: Colors.primaryLight }}>
          <Text className="text-xs font-semibold uppercase tracking-wider text-black">
            Next Session
          </Text>
        </View>
        {onDetailsPress && (
          <TouchableOpacity
            className="flex-row items-center gap-0.5"
            onPress={onDetailsPress}
            activeOpacity={0.7}
          >
            <Text className="text-xs font-semibold text-gray-400">Details</Text>
            <ChevronRight size={13} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
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
