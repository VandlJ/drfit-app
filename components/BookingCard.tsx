import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight, MapPin, CalendarDays } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import type { Reservation } from "@/constants/types";
import { formatDate } from "@/constants/types";

interface BookingCardProps {
  reservation: Reservation;
  onPress?: () => void;
}

export default function BookingCard({ reservation, onPress }: BookingCardProps) {
  const { slot, centerName } = reservation;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl px-4 py-3.5 flex-row items-center justify-between border border-gray-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="bg-primary rounded-xl w-10 h-10 items-center justify-center">
          <CalendarDays size={18} color={Colors.textPrimary} strokeWidth={1.75} />
        </View>
        <View className="gap-0.5">
          <Text className="text-sm font-semibold text-gray-900">
            {formatDate(slot.date)}
          </Text>
          <Text className="text-xs text-gray-500">
            {slot.startTime} – {slot.endTime}
          </Text>
          <View className="flex-row items-center gap-1 mt-0.5">
            <MapPin size={10} color={Colors.textMuted} />
            <Text className="text-[11px] text-gray-400">{centerName}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xs text-gray-400">{slot.priceCredits}</Text>
        <ChevronRight size={16} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}
