import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dumbbell, CalendarDays, KeyRound, Timer } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 px-6 justify-between py-10">
        <View />

        {/* Hero */}
        <View className="items-center gap-6">
          <View className="bg-primary rounded-3xl p-6">
            <Dumbbell size={56} color={Colors.textPrimary} strokeWidth={1.5} />
          </View>
          <View className="items-center gap-3">
            <Text className="text-5xl font-unbounded text-black tracking-tight">
              DrFit
            </Text>
            <Text className="text-base text-gray-500 text-center leading-relaxed max-w-xs">
              Your private fitness center, in your pocket. Book sessions,
              access your PIN, and track your training.
            </Text>
          </View>
          <View className="gap-3 w-full mt-4">
            {(
              [
                { Icon: CalendarDays, text: "Book sessions in seconds" },
                { Icon: KeyRound, text: "PIN delivered right before your slot" },
                { Icon: Timer, text: "Live training timer" },
              ] as const
            ).map((item) => (
              <View
                key={item.text}
                className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-gray-100"
              >
                <View className="bg-primary rounded-xl w-8 h-8 items-center justify-center">
                  <item.Icon size={16} color={Colors.textPrimary} strokeWidth={1.75} />
                </View>
                <Text className="text-sm font-medium text-gray-700">
                  {item.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center"
            onPress={() => router.push("/(auth)/register")}
            activeOpacity={0.85}
          >
            <Text className="text-black text-base font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.7}>
            <Text className="text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Text className="text-black font-semibold underline">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
