import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dumbbell } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 px-6 justify-between py-10">
        {/* Top spacer */}
        <View />

        {/* Hero section */}
        <View className="items-center gap-6">
          <View className="bg-primary rounded-3xl p-6">
            <Dumbbell size={56} color={Colors.textInverse} strokeWidth={1.5} />
          </View>

          <View className="items-center gap-3">
            <Text className="text-4xl font-bold text-gray-900 tracking-tight">
              DrFit
            </Text>
            <Text className="text-base text-gray-500 text-center leading-relaxed max-w-xs">
              Your private fitness center, in your pocket. Book sessions, access
              your PIN, and track your training.
            </Text>
          </View>

          {/* Feature list */}
          <View className="gap-3 w-full mt-4">
            {[
              { icon: "🗓", text: "Book sessions in seconds" },
              { icon: "🔑", text: "PIN delivered right before your slot" },
              { icon: "⏱", text: "Live training timer" },
            ].map((item) => (
              <View
                key={item.text}
                className="flex-row items-center gap-3 bg-white rounded-2xl px-4 py-3"
              >
                <Text className="text-xl">{item.icon}</Text>
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
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.85}
          >
            <Text className="text-white text-base font-semibold">
              Get Started
            </Text>
          </TouchableOpacity>
          <Text className="text-center text-xs text-gray-400">
            Already have an account? Sign in below.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
