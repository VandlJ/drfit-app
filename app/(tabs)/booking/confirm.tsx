import { useState } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, CalendarCheck, Wallet, MapPin } from "lucide-react-native";
import { useData } from "@/context/DataContext";
import { formatDate } from "@/constants/types";
import { Colors } from "@/constants/colors";

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ slotId: string; date: string }>();
  const { addReservation, creditBalance, selectedCenter, getSlotsForDate } = useData();
  const [isLoading, setIsLoading] = useState(false);

  // Look up the slot from the in-memory cache (already fetched by booking/index.tsx)
  const slots = getSlotsForDate(params.date);
  const slot = slots.find((s) => s.id === params.slotId);

  if (!slot) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100 items-center justify-center">
        <Text className="text-gray-500">Slot not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-black font-semibold">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const balanceAfter = creditBalance - slot.priceCredits;
  const canAfford = creditBalance >= slot.priceCredits;

  async function handleConfirm() {
    if (!canAfford) return;
    setIsLoading(true);
    try {
      await addReservation(slot!); // slot is always defined here — guarded by early return above
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Booking failed", err.message ?? "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Back + title */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full w-9 h-9 items-center justify-center"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text className="text-xl font-unbounded text-black">
              Confirm
            </Text>
          </View>

          {/* Session card */}
          <View className="bg-white rounded-2xl p-5 gap-4 border border-gray-100">
            <View className="flex-row items-center gap-3">
              <View className="bg-primary rounded-xl w-12 h-12 items-center justify-center">
                <CalendarCheck size={22} color={Colors.textPrimary} />
              </View>
              <View className="gap-0.5">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Training Session
                </Text>
                <Text className="text-lg font-bold text-black">
                  {formatDate(slot.date)}
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="gap-3">
              <Row label="Time" value={`${slot.startTime} – ${slot.endTime}`} />
              <Row label="Duration" value="60 minutes" />
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-500">Location</Text>
                <View className="flex-row items-center gap-1">
                  <MapPin size={12} color={Colors.textSecondary} />
                  <Text className="text-sm text-black font-medium">
                    {selectedCenter.name}
                  </Text>
                </View>
              </View>
              <Row label="Address" value={selectedCenter.address} />
            </View>
          </View>

          {/* Payment summary */}
          <View className="bg-white rounded-2xl p-5 gap-4 border border-gray-100">
            <View className="flex-row items-center gap-3">
              <View className="bg-primary rounded-xl w-12 h-12 items-center justify-center">
                <Wallet size={22} color={Colors.textPrimary} />
              </View>
              <Text className="text-base font-bold text-black">Payment</Text>
            </View>

            <View className="h-px bg-gray-100" />

            <View className="gap-3">
              <Row label="Session cost" value={`${slot.priceCredits} credits`} />
              <Row label="Current balance" value={`${creditBalance} credits`} />
              <View className="h-px bg-gray-100" />
              <Row
                label="Balance after"
                value={`${balanceAfter} credits`}
                valueStyle={balanceAfter < 0 ? "font-bold" : "font-bold text-black"}
                valueColor={balanceAfter < 0 ? Colors.danger : undefined}
              />
            </View>
          </View>

          {!canAfford && (
            <View
              className="border rounded-xl px-4 py-3"
              style={{ backgroundColor: Colors.dangerLight, borderColor: Colors.danger + "44" }}
            >
              <Text className="text-sm" style={{ color: Colors.danger }}>
                Not enough credits. Top up in the Credits tab first.
              </Text>
            </View>
          )}

          <TouchableOpacity
            className={`rounded-full py-4 items-center ${
              canAfford && !isLoading ? "bg-primary" : "bg-gray-200"
            }`}
            onPress={handleConfirm}
            disabled={!canAfford || isLoading}
            activeOpacity={0.85}
          >
            <Text
              className={`text-base font-semibold ${
                canAfford && !isLoading ? "text-black" : "text-gray-400"
              }`}
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  valueStyle,
  valueColor,
}: {
  label: string;
  value: string;
  valueStyle?: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text
        className={`text-sm text-black ${valueStyle ?? ""}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}
