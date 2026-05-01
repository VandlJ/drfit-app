import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Colors } from "@/constants/colors";
import type { Slot } from "@/constants/types";

interface SlotListProps {
  slots: Slot[];
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export default function SlotList({
  slots,
  selectedSlotId,
  onSelectSlot,
}: SlotListProps) {
  if (slots.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <Text className="text-gray-400 text-sm">No slots for this day.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, gap: 10 }}
    >
      {slots.map((slot) => {
        const isSelected = slot.id === selectedSlotId;
        const isUnavailable = !slot.isAvailable;

        return (
          <TouchableOpacity
            key={slot.id}
            onPress={() => !isUnavailable && onSelectSlot(slot)}
            activeOpacity={isUnavailable ? 1 : 0.75}
            disabled={isUnavailable}
            className={`
              flex-row items-center justify-between
              rounded-2xl px-5 py-4 border
              ${
                isSelected
                  ? "bg-primary border-primary"
                  : isUnavailable
                  ? "bg-gray-50 border-gray-100"
                  : "bg-white border-gray-100"
              }
            `}
          >
            {/* Time range */}
            <View className="gap-0.5">
              <Text
                className={`text-base font-bold ${
                  isSelected
                    ? "text-white"
                    : isUnavailable
                    ? "text-gray-300"
                    : "text-gray-900"
                }`}
              >
                {slot.startTime} – {slot.endTime}
              </Text>
              <Text
                className={`text-xs ${
                  isSelected
                    ? "text-white opacity-80"
                    : isUnavailable
                    ? "text-gray-300"
                    : "text-gray-400"
                }`}
              >
                60 min
              </Text>
            </View>

            {/* Right side */}
            <View className="items-end gap-1">
              <Text
                className={`text-sm font-semibold ${
                  isSelected
                    ? "text-white"
                    : isUnavailable
                    ? "text-gray-300"
                    : "text-gray-900"
                }`}
              >
                {slot.priceCredits} cr
              </Text>
              {isUnavailable ? (
                <View className="bg-gray-200 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-gray-400 font-medium">
                    Taken
                  </Text>
                </View>
              ) : isSelected ? (
                <View className="bg-white/20 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-white font-semibold">
                    Selected
                  </Text>
                </View>
              ) : (
                <View className="bg-green-50 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] text-primary font-medium">
                    Free
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
