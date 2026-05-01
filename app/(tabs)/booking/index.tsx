import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import WeekCalendar from "@/components/WeekCalendar";
import SlotList from "@/components/SlotList";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";
import type { Slot } from "@/constants/types";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export default function BookingScreen() {
  const router = useRouter();
  const { getSlotsForDate, creditBalance } = useData();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const slots = useMemo(
    () => getSlotsForDate(selectedDate),
    [selectedDate, getSlotsForDate]
  );

  // Build set of dates that have at least one available slot (for calendar dots)
  // For perf: only check the dates visible in the WeekCalendar (21 days)
  const availableDates = useMemo<Set<string>>(() => {
    const set = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 21; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const daySlots = getSlotsForDate(key);
      if (daySlots.some((s) => s.isAvailable)) set.add(key);
    }
    return set;
  }, [getSlotsForDate]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null); // reset slot when date changes
  }

  function handleProceed() {
    if (!selectedSlot) return;

    if (creditBalance < selectedSlot.priceCredits) {
      Alert.alert(
        "Insufficient Credits",
        `You need ${selectedSlot.priceCredits} credits but only have ${creditBalance}. Top up in the Credits tab.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Top Up",
            onPress: () => router.push("/(tabs)/credits/topup"),
          },
        ]
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/booking/confirm",
      params: {
        date: selectedSlot.date,
        slotIdx: slots.findIndex((s) => s.id === selectedSlot.id).toString(),
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 gap-4 pt-4">
        {/* Header */}
        <View className="px-6 gap-0.5">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            DrFit
          </Text>
          <Text className="text-2xl font-bold text-gray-900">Book a Session</Text>
        </View>

        {/* Date picker */}
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          availableDates={availableDates}
        />

        {/* Slot list */}
        <View className="flex-1 gap-3">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-6">
            Available Times
          </Text>
          <SlotList
            slots={slots}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelectSlot={setSelectedSlot}
          />
        </View>
      </View>

      {/* Bottom CTA — only shown when a slot is selected */}
      {selectedSlot && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-neutral-100 border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-500">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </Text>
            <Text className="text-sm font-semibold text-gray-900">
              {selectedSlot.priceCredits} credits
            </Text>
          </View>
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center"
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-semibold">
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
