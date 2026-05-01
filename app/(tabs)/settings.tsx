import { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, ChevronRight, LogOut, ScanFace } from "lucide-react-native";
import CenterPickerSheet from "@/components/CenterPickerSheet";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isFaceIDEnabled, enableFaceID, disableFaceID } = useAuth();
  const { centers, selectedCenter, setSelectedCenter } = useData();
  const [pickerVisible, setPickerVisible] = useState(false);

  async function handleToggleFaceID() {
    if (isFaceIDEnabled) {
      Alert.alert("Disable Face ID", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Disable", style: "destructive", onPress: disableFaceID },
      ]);
    } else {
      await enableFaceID();
    }
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="gap-0.5">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              DrFit
            </Text>
            <Text className="text-2xl font-bold text-gray-900">Settings</Text>
          </View>

          {/* User card */}
          <View className="bg-white rounded-2xl p-5 gap-3 border border-gray-100">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Account
            </Text>
            <View className="flex-row items-center gap-3">
              <View className="bg-primary rounded-full w-12 h-12 items-center justify-center">
                <Text className="text-white text-lg font-bold">
                  {user?.name?.charAt(0) ?? "?"}
                </Text>
              </View>
              <View className="gap-0.5">
                <Text className="text-base font-semibold text-gray-900">
                  {user?.name}
                </Text>
                <Text className="text-sm text-gray-500">{user?.email}</Text>
              </View>
            </View>
          </View>

          {/* Home gym */}
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-5 pt-4 pb-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Home Gym
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center gap-4 px-5 py-4"
              onPress={() => setPickerVisible(true)}
              activeOpacity={0.7}
            >
              <View className="bg-primary-light rounded-xl w-10 h-10 items-center justify-center">
                <MapPin size={18} color={Colors.primary} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-gray-900">
                  {selectedCenter.name}
                </Text>
                <Text className="text-xs text-gray-500">
                  {selectedCenter.address}
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Security */}
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-5 pt-4 pb-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Security
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center gap-4 px-5 py-4"
              onPress={handleToggleFaceID}
              activeOpacity={0.7}
            >
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center">
                <ScanFace size={18} color={Colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-900">
                  Face ID
                </Text>
                <Text className="text-xs text-gray-500">
                  {isFaceIDEnabled ? "Enabled — tap to disable" : "Disabled — tap to enable"}
                </Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  isFaceIDEnabled ? "bg-primary border-primary" : "border-gray-300"
                }`}
              >
                {isFaceIDEnabled && (
                  <Text className="text-white text-[10px] font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Feedback */}
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-5 pt-4 pb-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Support
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center gap-4 px-5 py-4"
              activeOpacity={0.7}
              onPress={() =>
                Alert.alert("Feedback", "Send your feedback to: info@drfit.cz")
              }
            >
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center">
                <Text className="text-base">💬</Text>
              </View>
              <Text className="flex-1 text-sm font-semibold text-gray-900">
                Send Feedback
              </Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Sign out */}
          <TouchableOpacity
            className="bg-red-50 border border-red-100 rounded-2xl py-4 items-center"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text className="text-red-600 text-sm font-semibold">Sign Out</Text>
          </TouchableOpacity>

          <Text className="text-center text-xs text-gray-300">
            DrFit v1.0.0
          </Text>
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
