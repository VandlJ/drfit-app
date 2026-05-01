import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useData } from "@/context/DataContext";
import { Colors, StatusColors } from "@/constants/colors";
import { formatDate } from "@/constants/types";
import type { Reservation, ReservationStatus } from "@/constants/types";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  active: "Upcoming",
  completed: "Completed",
  cancelled: "Cancelled",
};

const FILTER_OPTIONS: Array<{ key: ReservationStatus | "all"; label: string }> =
  [
    { key: "all", label: "All" },
    { key: "active", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

export default function HistoryScreen() {
  const { reservations, cancelReservation } = useData();
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");

  const filtered = reservations
    .filter((r) => filter === "all" || r.status === filter)
    .sort(
      (a, b) =>
        new Date(b.slot.date + "T" + b.slot.startTime).getTime() -
        new Date(a.slot.date + "T" + a.slot.startTime).getTime()
    );

  function handleCancel(r: Reservation) {
    Alert.alert(
      "Cancel Session",
      `Are you sure you want to cancel the ${formatDate(r.slot.date)} ${r.slot.startTime} session? Your credits will be refunded.`,
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel session",
          style: "destructive",
          onPress: () => cancelReservation(r.id),
        },
      ]
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 gap-4 pt-4">
        {/* Header */}
        <View className="px-6 gap-0.5">
          <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            DrFit
          </Text>
          <Text className="text-2xl font-bold text-gray-900">History</Text>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setFilter(opt.key)}
              activeOpacity={0.7}
              className={`rounded-full px-4 py-2 ${
                filter === opt.key
                  ? "bg-primary"
                  : "bg-white border border-gray-200"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  filter === opt.key ? "text-white" : "text-gray-600"
                }`}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 10 }}
        >
          {filtered.length === 0 ? (
            <View className="bg-white rounded-2xl py-12 items-center border border-gray-100 mt-2">
              <Text className="text-gray-400 text-sm">
                No sessions found.
              </Text>
            </View>
          ) : (
            filtered.map((r) => (
              <ReservationRow
                key={r.id}
                reservation={r}
                onCancel={() => handleCancel(r)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ReservationRow({
  reservation: r,
  onCancel,
}: {
  reservation: Reservation;
  onCancel: () => void;
}) {
  const statusColor = StatusColors[r.status] ?? StatusColors.active;
  const isCancellable =
    r.status === "active" &&
    new Date(r.slot.date + "T" + r.slot.startTime) > new Date();

  return (
    <View className="bg-white rounded-2xl px-4 py-4 border border-gray-100 gap-3">
      {/* Top row */}
      <View className="flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-base font-bold text-gray-900">
            {formatDate(r.slot.date)}
          </Text>
          <Text className="text-sm text-gray-500">
            {r.slot.startTime} – {r.slot.endTime}
          </Text>
        </View>

        {/* Status badge */}
        <View
          style={{ backgroundColor: statusColor.bg }}
          className="rounded-full px-3 py-1"
        >
          <Text
            style={{ color: statusColor.text }}
            className="text-xs font-semibold"
          >
            {STATUS_LABELS[r.status]}
          </Text>
        </View>
      </View>

      {/* Bottom row */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-400">
          {r.creditsSpent > 0
            ? `${r.creditsSpent} credits`
            : r.status === "cancelled"
            ? "Refunded"
            : "—"}
        </Text>

        {isCancellable && (
          <TouchableOpacity
            className="flex-row items-center gap-1 py-1"
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <X size={13} color={Colors.danger} />
            <Text className="text-xs text-red-600 font-medium">
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
