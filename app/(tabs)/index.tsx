import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, Wallet, Dumbbell } from "lucide-react-native";
import ActiveTimer from "@/components/ActiveTimer";
import BookingCard from "@/components/BookingCard";
import CenterPickerSheet from "@/components/CenterPickerSheet";
import ReservationDetailSheet from "@/components/ReservationDetailSheet";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";
import { getHeroCardState } from "@/constants/types";
import type { Reservation } from "@/constants/types";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // eslint-disable-next-line no-console
  console.log("[Home] user.avatarUrl =", user?.avatarUrl);
  const {
    reservations,
    creditBalance,
    centers,
    selectedCenter,
    setSelectedCenter,
    cancelReservation,
  } = useData();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const activeReservations = reservations
    .filter((r) => r.status === "active")
    .sort(
      (a, b) =>
        new Date(a.slot.date + "T" + a.slot.startTime).getTime() -
        new Date(b.slot.date + "T" + b.slot.startTime).getTime()
    );

  const nextReservation = activeReservations[0] ?? null;
  const upcomingReservations = activeReservations.slice(1);
  const isActiveNow = nextReservation && getHeroCardState(nextReservation) === "active_timer";

  return (
    <SafeAreaView className="flex-1 bg-neutral-100" edges={["top","left","right"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              {/* Avatar */}
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: Colors.primary }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: Colors.primary }}
                >
                  <Text className="text-black font-unbounded" style={{ fontSize: 18 }}>
                    {(user?.name?.trim()?.[0] ?? "?").toUpperCase()}
                  </Text>
                </View>
              )}

              <View className="gap-0.5 flex-1">
                <Text className="text-xs text-gray-400">Welcome back</Text>
                <Text
                  className="text-lg font-unbounded text-black"
                  numberOfLines={1}
                >
                  {user?.name ?? "there"}
                </Text>
              </View>
            </View>

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

          {/* Reservations — active session timer (if running) + unified list */}
          {isActiveNow && nextReservation ? (
            <>
              <ActiveTimer reservation={nextReservation} />
              {upcomingReservations.length > 0 && (
                <View className="gap-3">
                  <Text className="text-xs font-bold uppercase tracking-widest text-gray-700">
                    Upcoming
                  </Text>
                  <View className="gap-3">
                    {upcomingReservations.map((r, idx) => (
                      <BookingCard
                        key={r.id}
                        reservation={r}
                        isNext={idx === 0}
                        onPress={() => setSelectedReservation(r)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </>
          ) : nextReservation ? (
            <View className="gap-3">
              <Text className="text-xs font-bold uppercase tracking-widest text-gray-700">
                Upcoming
              </Text>
              <View className="gap-3">
                <BookingCard
                  reservation={nextReservation}
                  isNext
                  onPress={() => setSelectedReservation(nextReservation)}
                />
                {upcomingReservations.map((r) => (
                  <BookingCard
                    key={r.id}
                    reservation={r}
                    onPress={() => setSelectedReservation(r)}
                  />
                ))}
              </View>
            </View>
          ) : (
            // Empty state
            <View className="bg-white rounded-2xl p-6 border border-gray-100 items-center gap-4">
              <View className="bg-neutral-100 rounded-full p-4">
                <Dumbbell size={36} color={Colors.textMuted} strokeWidth={1.5} />
              </View>
              <View className="items-center gap-1">
                <Text className="text-base font-semibold text-black">
                  No upcoming sessions
                </Text>
                <Text className="text-sm text-gray-500 text-center">
                  Book your next training to get started.
                </Text>
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

      <ReservationDetailSheet
        reservation={selectedReservation}
        visible={!!selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onCancel={cancelReservation}
      />
    </SafeAreaView>
  );
}
