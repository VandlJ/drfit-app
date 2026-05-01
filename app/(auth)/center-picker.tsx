import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, ChevronRight } from "lucide-react-native";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";
import type { Center } from "@/constants/types";

export default function CenterPickerScreen() {
  const router = useRouter();
  const { centers, isLoadingData, setSelectedCenter } = useData();
  const [picked, setPicked] = useState<Center | null>(null);

  // Pre-select first center when centers load
  useEffect(() => {
    if (centers.length > 0 && !picked) {
      setPicked(centers[0]);
    }
  }, [centers]);

  function handleContinue() {
    if (!picked) return;
    setSelectedCenter(picked);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <View className="flex-1 px-6 justify-between py-10">
        <View />

        <View className="gap-6">
          {/* Icon + title */}
          <View className="items-center gap-4">
            <View className="bg-primary rounded-3xl p-5">
              <MapPin size={40} color={Colors.textPrimary} strokeWidth={1.5} />
            </View>
            <View className="items-center gap-2">
              <Text className="text-2xl font-unbounded text-black text-center">
                Choose your gym
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                This will be your home gym. You can change it anytime in Settings.
              </Text>
            </View>
          </View>

          {/* Center list */}
          {isLoadingData ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={Colors.textMuted} />
            </View>
          ) : (
            <View className="gap-3">
              {centers.map((center) => {
                const isSelected = center.id === picked?.id;
                return (
                  <TouchableOpacity
                    key={center.id}
                    onPress={() => setPicked(center)}
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
                      <Text className="text-base font-semibold text-black">
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
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity
          className={`rounded-full py-4 items-center flex-row justify-center gap-2 ${
            picked ? "bg-primary" : "bg-gray-200"
          }`}
          onPress={handleContinue}
          disabled={!picked}
          activeOpacity={0.85}
        >
          <Text className={`text-base font-semibold ${picked ? "text-black" : "text-gray-400"}`}>
            Continue
          </Text>
          {picked && <ChevronRight size={18} color={Colors.textPrimary} strokeWidth={2.5} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
