import { useRef, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/colors";

interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableDates?: Set<string>;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_TO_SHOW = 21; // 3 weeks ahead

function formatDateKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildDays(): Array<{ key: string; dayName: string; dayNum: number; isToday: boolean }> {
  const days = [];
  const today = new Date();
  for (let i = 0; i < DAYS_TO_SHOW; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: formatDateKey(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

export default function WeekCalendar({
  selectedDate,
  onSelectDate,
  availableDates,
}: WeekCalendarProps) {
  const scrollRef = useRef<ScrollView>(null);
  const days = buildDays();

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, []);

  return (
    <View className="gap-2">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-6">
        Select Date
      </Text>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
      >
        {days.map((day) => {
          const isSelected = day.key === selectedDate;
          const hasSlots = !availableDates || availableDates.has(day.key);

          return (
            <TouchableOpacity
              key={day.key}
              onPress={() => onSelectDate(day.key)}
              activeOpacity={0.7}
              className={`items-center rounded-2xl py-3 px-2 w-16 gap-1 ${
                isSelected
                  ? "bg-primary"
                  : "bg-white border border-gray-100"
              }`}
            >
              <Text
                className={`text-[11px] font-semibold ${
                  isSelected ? "text-black" : "text-gray-400"
                }`}
              >
                {day.dayName}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  isSelected ? "text-black" : "text-black"
                }`}
              >
                {day.dayNum}
              </Text>
              {/* Available dot — visible on any date with slots */}
              <View
                className={`w-1.5 h-1.5 rounded-full ${
                  hasSlots
                    ? isSelected ? "bg-black opacity-40" : "bg-primary"
                    : "bg-transparent"
                }`}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
