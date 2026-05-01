import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import type { Reservation } from "@/constants/types";
import { formatDate } from "@/constants/types";

interface BookingCardProps {
  reservation: Reservation;
  onPress?: () => void;
}

export default function BookingCard({ reservation, onPress }: BookingCardProps) {
  const { slot } = reservation;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl px-4 py-3.5 flex-row items-center justify-between border border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-primary-light rounded-xl w-10 h-10 items-center justify-center">
          <Text className="text-base">🗓</Text>
        </View>
        <View className="gap-0.5">
          <Text className="text-sm font-semibold text-gray-900">
            {formatDate(slot.date)}
          </Text>
          <Text className="text-xs text-gray-500">
            {slot.startTime} – {slot.endTime}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xs text-gray-400">{slot.priceCredits} cr</Text>
        <ChevronRight size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
