import { useState, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, ChevronDown, Wallet } from "lucide-react-native";
import WeekCalendar from "@/components/WeekCalendar";
import SlotList from "@/components/SlotList";
import CenterPickerSheet from "@/components/CenterPickerSheet";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";
import type { Slot } from "@/constants/types";

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export default function BookingScreen() {
  const router = useRouter();
  const {
    getSlotsForDate,
    fetchSlotsForDate,
    creditBalance,
    centers,
    selectedCenter,
    setSelectedCenter,
  } = useData();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  // Fetch slots whenever date or center changes
  useEffect(() => {
    if (!selectedCenter?.id) return;
    setIsFetchingSlots(true);
    fetchSlotsForDate(selectedDate).finally(() => setIsFetchingSlots(false));
  }, [selectedDate, selectedCenter?.id]);

  // Pre-fetch next 7 days for the availability dots
  useEffect(() => {
    if (!selectedCenter?.id) return;
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      fetchSlotsForDate(d.toISOString().split("T")[0]);
    }
  }, [selectedCenter?.id]);

  const slots = useMemo(
    () => getSlotsForDate(selectedDate),
    [selectedDate, getSlotsForDate, selectedCenter?.id]
  );

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
  }, [getSlotsForDate, selectedCenter?.id]);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleProceed() {
    if (!selectedSlot) return;

    if (creditBalance < selectedSlot.priceCredits) {
      Alert.alert(
        "Insufficient Credits",
        `You need ${selectedSlot.priceCredits} credits but only have ${creditBalance}. Top up in the Credits tab.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Top Up", onPress: () => router.push("/(tabs)/credits/topup") },
        ]
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/booking/confirm",
      params: { slotId: selectedSlot.id, date: selectedSlot.date },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100" edges={["top","left","right"]}>
      <View className="flex-1 gap-4 pt-4">
        {/* Header */}
        <View className="px-6 gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-unbounded text-black">Book</Text>
            {/* Credits chip */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full px-3 py-2 flex-row items-center gap-1.5"
              onPress={() => router.push("/(tabs)/credits")}
              activeOpacity={0.7}
            >
              <Wallet size={14} color={Colors.textSecondary} />
              <Text className="text-sm font-semibold text-black">
                {creditBalance} <Text className="text-gray-400 font-normal">cr</Text>
              </Text>
            </TouchableOpacity>
          </View>
          {/* Center switcher */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mt-0.5 self-start"
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <MapPin size={12} color={Colors.textSecondary} />
            <Text className="text-sm font-medium text-gray-600">
              {selectedCenter.name}
            </Text>
            <ChevronDown size={12} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Date picker */}
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          availableDates={availableDates}
        />

        {/* Slot list */}
        <View className="flex-1 gap-3">
          <View className="flex-row items-center gap-2 px-6">
            <Text className="text-xs font-bold uppercase tracking-widest text-gray-700">
              Available Times
            </Text>
            {isFetchingSlots && (
              <ActivityIndicator size="small" color={Colors.textMuted} />
            )}
          </View>
          <SlotList
            slots={slots}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelectSlot={setSelectedSlot}
          />
        </View>
      </View>

      {/* Bottom CTA */}
      {selectedSlot && (
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-neutral-100 border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-gray-500">
              {selectedSlot.startTime} – {selectedSlot.endTime}
            </Text>
            <Text className="text-sm font-semibold text-black">
              {selectedSlot.priceCredits} credits
            </Text>
          </View>
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center"
            onPress={handleProceed}
            activeOpacity={0.85}
          >
            <Text className="text-black text-base font-semibold">Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      <CenterPickerSheet
        visible={pickerVisible}
        centers={centers}
        selectedCenterId={selectedCenter.id}
        onSelect={(c) => {
          setSelectedCenter(c);
          setSelectedSlot(null);
        }}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
