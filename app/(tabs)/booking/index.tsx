import { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, ChevronDown } from "lucide-react-native";
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
  const { getSlotsForDate, creditBalance, centers, selectedCenter, setSelectedCenter } =
    useData();

  const [selectedDate, setSelectedDate] = useState<string>(getTodayKey());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const slots = useMemo(
    () => getSlotsForDate(selectedDate),
    [selectedDate, getSlotsForDate]
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
  }, [getSlotsForDate]);

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
        <View className="px-6 gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            DrFit
          </Text>
          <Text className="text-2xl font-bold text-gray-900">Book a Session</Text>
          {/* Center switcher */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mt-0.5 self-start"
            onPress={() => setPickerVisible(true)}
            activeOpacity={0.7}
          >
            <MapPin size={12} color={Colors.primary} />
            <Text className="text-sm font-medium text-primary">
              {selectedCenter.name}
            </Text>
            <ChevronDown size={12} color={Colors.primary} />
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

      {/* Bottom CTA */}
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
            <Text className="text-white text-base font-semibold">Continue</Text>
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
