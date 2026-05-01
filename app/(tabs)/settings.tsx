import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, ChevronRight, LogOut, MessageSquare, Star, X, CalendarDays } from "lucide-react-native";
import { SymbolView } from "expo-symbols";
import * as Calendar from "expo-calendar";
import CenterPickerSheet from "@/components/CenterPickerSheet";
import EditProfileSheet from "@/components/EditProfileSheet";
import { Image } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { apiSubmitFeedback } from "@/lib/api";
import { Colors } from "@/constants/colors";
import { getSlotStartDate, getSlotEndDate } from "@/constants/types";

export default function SettingsScreen() {
  const { user, logout, isFaceIDEnabled, enableFaceID, disableFaceID, updateProfile, changePassword, uploadAvatar } = useAuth();
  const { centers, selectedCenter, setSelectedCenter, reservations } = useData();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Feedback modal state
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggleFaceID() {
    if (isFaceIDEnabled) {
      Alert.alert("Disable Face ID", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        { text: "Disable", style: "destructive", onPress: disableFaceID },
      ]);
    } else {
      const success = await enableFaceID();
      if (success) {
        Alert.alert("Face ID Enabled", "You can now sign in with Face ID.");
      } else {
        Alert.alert(
          "Face ID Unavailable",
          "Face ID is not set up on this device. Go to Settings → Face ID & Passcode to configure it."
        );
      }
    }
  }

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  }

  async function handleExportToCalendar() {
    const upcoming = reservations.filter((r) => {
      if (r.status !== "active") return false;
      const start = getSlotStartDate(r.slot);
      return start.getTime() > Date.now();
    });

    if (upcoming.length === 0) {
      Alert.alert("No upcoming sessions", "You have no upcoming sessions to export.");
      return;
    }

    setIsExporting(true);
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Please allow calendar access in Settings to export sessions."
        );
        return;
      }

      // Get or create a dedicated DrFit calendar
      const allCalendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let drfitCalendar = allCalendars.find((c) => c.title === "DrFit");
      let calendarId: string;

      if (drfitCalendar) {
        calendarId = drfitCalendar.id;
      } else {
        const defaultCal = await Calendar.getDefaultCalendarAsync();
        calendarId = await Calendar.createCalendarAsync({
          title: "DrFit",
          color: Colors.primary,
          entityType: Calendar.EntityTypes.EVENT,
          sourceId: defaultCal.source?.id,
          source: defaultCal.source,
          name: "DrFit",
          ownerAccount: "personal",
          accessLevel: Calendar.CalendarAccessLevel.OWNER,
        });
      }

      // Add each upcoming session as an event
      let added = 0;
      for (const r of upcoming) {
        const startDate = getSlotStartDate(r.slot);
        const endDate = getSlotEndDate(r.slot);
        const centerName = r.centerName && r.centerName !== "—" ? r.centerName : "DrFit";
        const address = r.centerAddress && r.centerAddress !== "—" ? r.centerAddress : undefined;

        await Calendar.createEventAsync(calendarId, {
          title: `DrFit — ${centerName}`,
          startDate,
          endDate,
          location: address,
          notes: r.pin
            ? `Entry PIN: ${r.pin}\n\nTraining session booked via DrFit.`
            : "Training session booked via DrFit.",
          alarms: [{ relativeOffset: -30 }],
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        added++;
      }

      Alert.alert(
        "Added to Calendar",
        `${added} session${added !== 1 ? "s" : ""} added to your DrFit calendar.`
      );
    } catch (e: any) {
      Alert.alert("Export failed", e?.message ?? "Something went wrong. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  function openFeedback() {    setRating(0);
    setComment("");
    setFeedbackVisible(true);
  }

  async function submitFeedback() {
    if (rating === 0) {
      Alert.alert("Rating required", "Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiSubmitFeedback({ rating, comment: comment.trim() || undefined });
      setFeedbackVisible(false);
      Alert.alert("Thank you!", "Your feedback has been sent.");
    } catch {
      Alert.alert("Error", "Failed to send feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100" edges={["top","left","right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-unbounded text-black">Settings</Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full w-9 h-9 items-center justify-center"
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={16} color={Colors.danger} />
            </TouchableOpacity>
          </View>

          {/* User card */}
          <TouchableOpacity
            className="bg-white rounded-2xl p-5 gap-3 border border-gray-100"
            onPress={() => setProfileVisible(true)}
            activeOpacity={0.7}
          >
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Account
            </Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={{ width: 48, height: 48 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-black text-lg font-bold">
                      {user?.name?.charAt(0) ?? "?"}
                    </Text>
                  )}
                </View>
                <View className="gap-0.5">
                  <Text className="text-base font-semibold text-black">{user?.name}</Text>
                  <Text className="text-sm text-gray-500">{user?.email}</Text>
                </View>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </View>
          </TouchableOpacity>

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
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center">
                <MapPin size={18} color={Colors.textSecondary} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-sm font-semibold text-black">
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
                <SymbolView name="faceid" size={20} tintColor={Colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-black">
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
                  <Text className="text-black text-[10px] font-bold">✓</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <View className="px-5 pt-4 pb-2">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Calendar
              </Text>
            </View>
            <TouchableOpacity
              className="flex-row items-center gap-4 px-5 py-4"
              onPress={handleExportToCalendar}
              activeOpacity={0.7}
              disabled={isExporting}
            >
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center">
                {isExporting ? (
                  <ActivityIndicator size="small" color={Colors.textSecondary} />
                ) : (
                  <CalendarDays size={18} color={Colors.textSecondary} strokeWidth={1.75} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-black">
                  Export Sessions
                </Text>
                <Text className="text-xs text-gray-500">
                  Add upcoming sessions to Apple Calendar
                </Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
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
              onPress={openFeedback}
            >
              <View className="bg-gray-100 rounded-xl w-10 h-10 items-center justify-center">
                <MessageSquare size={18} color={Colors.textSecondary} />
              </View>
              <Text className="flex-1 text-sm font-semibold text-black">
                Send Feedback
              </Text>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

        </View>
      </SafeAreaView>
      <Modal
        visible={feedbackVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFeedbackVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10 gap-5">
            {/* Handle + title */}
            <View className="items-center">
              <View className="w-10 h-1 rounded-full bg-gray-200 mb-4" />
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-black">Send Feedback</Text>
              <TouchableOpacity
                onPress={() => setFeedbackVisible(false)}
                className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Star rating */}
            <View className="gap-2">
              <Text className="text-sm text-gray-500">How was your experience?</Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Star
                      size={36}
                      color={star <= rating ? "#C8EF2F" : Colors.textMuted}
                      fill={star <= rating ? "#C8EF2F" : "transparent"}
                      strokeWidth={1.5}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Comment input */}
            <View className="gap-2">
              <Text className="text-sm text-gray-500">Comment (optional)</Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Tell us what you think..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black"
                style={{ minHeight: 80, textAlignVertical: "top" }}
                maxLength={500}
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              className={`rounded-full py-4 items-center ${
                rating > 0 && !isSubmitting ? "bg-primary" : "bg-gray-200"
              }`}
              onPress={submitFeedback}
              disabled={rating === 0 || isSubmitting}
              activeOpacity={0.85}
            >
              <Text
                className={`text-base font-semibold ${
                  rating > 0 && !isSubmitting ? "text-black" : "text-gray-400"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <CenterPickerSheet
        visible={pickerVisible}
        centers={centers}
        selectedCenterId={selectedCenter.id}
        onSelect={setSelectedCenter}
        onClose={() => setPickerVisible(false)}
      />

      <EditProfileSheet
        visible={profileVisible}
        user={user}
        onClose={() => setProfileVisible(false)}
        onUpdateProfile={updateProfile}
        onChangePassword={changePassword}
        onUploadAvatar={uploadAvatar}
      />
    </>
  );
}
