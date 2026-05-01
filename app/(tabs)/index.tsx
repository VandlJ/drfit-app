import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, MapPin, ChevronDown, Wallet } from "lucide-react-native";
import HeroCard from "@/components/HeroCard";
import BookingCard from "@/components/BookingCard";
import CenterPickerSheet from "@/components/CenterPickerSheet";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    reservations,
    creditBalance,
    centers,
    selectedCenter,
    setSelectedCenter,
  } = useData();
  const [pickerVisible, setPickerVisible] = useState(false);

  const activeReservations = reservations
    .filter((r) => r.status === "active")
    .sort(
      (a, b) =>
        new Date(a.slot.date + "T" + a.slot.startTime).getTime() -
        new Date(b.slot.date + "T" + b.slot.startTime).getTime()
    );

  const heroReservation = activeReservations[0] ?? null;
  const upcomingReservations = activeReservations.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="gap-1">
              <Text className="text-2xl font-unbounded text-black">
                Hello, {user?.name?.split(" ")[0] ?? "there"}
              </Text>
              {/* Center switcher */}
              <TouchableOpacity
                className="flex-row items-center gap-1 mt-0.5"
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

            {/* Credits chip */}
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full px-3 py-2 flex-row items-center gap-1.5"
              onPress={() => router.push("/(tabs)/credits")}
              activeOpacity={0.7}
            >
              <Wallet size={14} color={Colors.textSecondary} />
              <Text className="text-sm font-semibold text-black">
                {creditBalance}
              </Text>
              <Text className="text-xs text-gray-400">cr</Text>
            </TouchableOpacity>
          </View>

          {/* Hero card */}
          <HeroCard reservation={heroReservation} />

          {/* Upcoming */}
          {upcomingReservations.length > 0 && (
            <View className="gap-3">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Upcoming
              </Text>
              <View className="gap-2">
                {upcomingReservations.map((r) => (
                  <BookingCard key={r.id} reservation={r} />
                ))}
              </View>
            </View>
          )}

          {/* New booking CTA */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 bg-primary rounded-2xl py-4"
            onPress={() => router.push("/(tabs)/booking")}
            activeOpacity={0.8}
          >
            <Plus size={18} color={Colors.textPrimary} />
            <Text className="text-black text-sm font-semibold">
              Book a Session
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CenterPickerSheet
        visible={pickerVisible}
        centers={centers}
        selectedCenterId={selectedCenter.id}
        onSelect={setSelectedCenter}
        onClose={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}
