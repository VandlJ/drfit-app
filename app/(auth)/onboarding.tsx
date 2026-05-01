import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dumbbell, MapPin, ChevronRight, CalendarDays, KeyRound, Timer } from "lucide-react-native";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";
import type { Center } from "@/constants/types";

export default function OnboardingScreen() {
  const router = useRouter();
  const { centers, setSelectedCenter } = useData();
  const [step, setStep] = useState<0 | 1>(0);
  const [pickedCenter, setPickedCenter] = useState<Center>(centers[0]);

  function handleContinue() {
    setSelectedCenter(pickedCenter);
    router.replace("/(auth)/login");
  }

  // ── Step 0: Welcome ───────────────────────────────────────────────────────
  if (step === 0) {
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
              onPress={() => setStep(1)}
              activeOpacity={0.85}
            >
              <Text className="text-black text-base font-semibold">
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

  // ── Step 1: Center picker ─────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 px-6 justify-between py-10">
        <View />

        {/* Content */}
        <View className="gap-6">
          {/* Icon + title */}
          <View className="items-center gap-4">
            <View className="bg-primary rounded-3xl p-5">
              <MapPin size={40} color={Colors.textPrimary} strokeWidth={1.5} />
            </View>
            <View className="items-center gap-2">
              <Text className="text-2xl font-unbounded text-black text-center">
                Vyber centrum
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Toto bude tvůj domovský gym. Kdykoli ho můžeš změnit v nastavení.
              </Text>
            </View>
          </View>

          {/* Center cards */}
          <View className="gap-3">
            {centers.map((center) => {
              const isSelected = center.id === pickedCenter.id;
              return (
                <TouchableOpacity
                  key={center.id}
                  onPress={() => setPickedCenter(center)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-4 p-4 rounded-2xl border-2 ${
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View
                    className={`rounded-xl p-3 ${
                      isSelected ? "bg-primary" : "bg-gray-100"
                    }`}
                  >
                    <MapPin
                      size={22}
                      color={isSelected ? Colors.textPrimary : Colors.textSecondary}
                    />
                  </View>
                  <View className="flex-1 gap-0.5">
                    <Text
                      className={`text-base font-semibold ${
                        isSelected ? "text-black" : "text-gray-900"
                      }`}
                    >
                      {center.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {center.address}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                      <Text className="text-black text-xs font-bold">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA */}
        <View className="gap-3">
          <TouchableOpacity
            className="bg-primary rounded-full py-4 items-center flex-row justify-center gap-2"
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text className="text-black text-base font-semibold">
              Pokračovat
            </Text>
            <ChevronRight size={18} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(0)} className="py-2 items-center">
            <Text className="text-sm text-gray-400">← Zpět</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
