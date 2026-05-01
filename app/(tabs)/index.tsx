import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus, LogOut } from "lucide-react-native";
import HeroCard from "@/components/HeroCard";
import BookingCard from "@/components/BookingCard";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { reservations } = useData();

  // Only show active (future) reservations
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
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                DrFit
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                Hello, {user?.name?.split(" ")[0] ?? "there"} 👋
              </Text>
            </View>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full w-10 h-10 items-center justify-center"
              onPress={logout}
              activeOpacity={0.7}
            >
              <LogOut size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Hero card */}
          <View className="gap-2">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Your next session
            </Text>
            <HeroCard reservation={heroReservation} />
          </View>

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
            className="flex-row items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-4"
            onPress={() => router.push("/(tabs)/booking")}
            activeOpacity={0.7}
          >
            <Plus size={18} color={Colors.primary} />
            <Text className="text-primary text-sm font-semibold">
              Book a New Session
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
