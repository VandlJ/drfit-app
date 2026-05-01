import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X, Camera, User, Mail, Lock, Calendar, Eye, EyeOff } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";
import type { User as UserType } from "@/constants/types";

interface EditProfileSheetProps {
  visible: boolean;
  user: UserType | null;
  onClose: () => void;
  onUpdateProfile: (fields: { name?: string; email?: string; dateOfBirth?: string | null }) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onUploadAvatar: (imageUri: string) => Promise<void>;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function EditProfileSheet({
  visible,
  user,
  onClose,
  onUpdateProfile,
  onChangePassword,
  onUploadAvatar,
}: EditProfileSheetProps) {
  const [modalMounted, setModalMounted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync fields when sheet opens
  useEffect(() => {
    if (visible && user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setDateOfBirth(user.dateOfBirth ?? "");
      setCurrentPassword("");
      setNewPassword("");
    }
  }, [visible, user]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
      setModalMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, easing: Easing.in(Easing.ease), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ]).start(() => setModalMounted(false));
    }
  }, [visible]);

  async function handlePickAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Please allow photo library access to change your avatar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    setIsUploadingAvatar(true);
    try {
      await onUploadAvatar(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Could not upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  const avatarUrl = user?.avatarUrl ?? null;

  async function handleSaveProfile() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        dateOfBirth: dateOfBirth.trim() || null,
      });
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      Alert.alert("Missing fields", "Please fill in both password fields.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Weak password", "New password must be at least 6 characters.");
      return;
    }
    setIsChangingPassword(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      Alert.alert("Done", "Your password has been changed.");
    } catch (e: any) {
      Alert.alert("Failed", e?.message ?? "Could not change password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          opacity: fadeAnim,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable>
            <View className="bg-white rounded-t-3xl pb-10" style={{ maxHeight: SCREEN_HEIGHT * 0.88 }}>
              {/* Drag handle */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mt-5 mb-2" />

              {/* Header */}
              <View className="flex-row items-center justify-between px-6 py-3">
                <Text className="text-lg font-bold text-gray-900">Edit Profile</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16, gap: 24 }}
              >
                {/* Avatar */}
                <View className="items-center gap-3 pt-2">
                  <TouchableOpacity
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}
                    disabled={isUploadingAvatar}
                  >
                    <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center overflow-hidden">
                      {isUploadingAvatar ? (
                        <ActivityIndicator color={Colors.textSecondary} />
                      ) : avatarUrl ? (
                        <Image
                          source={{ uri: avatarUrl }}
                          style={{ width: 80, height: 80 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text className="text-black text-3xl font-bold">
                          {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                        </Text>
                      )}
                    </View>
                    <View className="absolute bottom-0 right-0 bg-primary rounded-full w-7 h-7 items-center justify-center border-2 border-white">
                      <Camera size={13} color={Colors.textPrimary} />
                    </View>
                  </TouchableOpacity>
                  <Text className="text-xs text-gray-400">Tap to change photo</Text>
                </View>

                {/* Profile fields */}
                <View className="gap-3">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Profile Info
                  </Text>

                  {/* Name */}
                  <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <User size={16} color={Colors.textSecondary} />
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="Full name"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="words"
                      className="flex-1 text-sm text-black"
                      style={{ paddingVertical: 0 }}
                    />
                  </View>

                  {/* Email */}
                  <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <Mail size={16} color={Colors.textSecondary} />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 text-sm text-black"
                      style={{ paddingVertical: 0 }}
                    />
                  </View>

                  {/* Date of birth */}
                  <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <Calendar size={16} color={Colors.textSecondary} />
                    <TextInput
                      value={dateOfBirth}
                      onChangeText={setDateOfBirth}
                      placeholder="Date of birth (YYYY-MM-DD)"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numbers-and-punctuation"
                      className="flex-1 text-sm text-black"
                      style={{ paddingVertical: 0 }}
                    />
                  </View>

                  <TouchableOpacity
                    className={`bg-primary rounded-2xl py-4 items-center ${isSaving ? "opacity-50" : ""}`}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                    activeOpacity={0.85}
                  >
                    {isSaving
                      ? <ActivityIndicator color={Colors.textPrimary} />
                      : <Text className="text-sm font-semibold text-black">Save Changes</Text>
                    }
                  </TouchableOpacity>
                </View>

                {/* Change password */}
                <View className="gap-3">
                  <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Change Password
                  </Text>

                  {/* Current password */}
                  <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <Lock size={16} color={Colors.textSecondary} />
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current password"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry={!showCurrentPw}
                      textContentType="oneTimeCode"
                      autoComplete="off"
                      className="flex-1 text-sm text-black"
                      style={{ paddingVertical: 0 }}
                    />
                    <TouchableOpacity onPress={() => setShowCurrentPw((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      {showCurrentPw
                        ? <EyeOff size={16} color={Colors.textMuted} />
                        : <Eye size={16} color={Colors.textMuted} />
                      }
                    </TouchableOpacity>
                  </View>

                  {/* New password */}
                  <View className="flex-row items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200">
                    <Lock size={16} color={Colors.textSecondary} />
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="New password"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry={!showNewPw}
                      textContentType="oneTimeCode"
                      autoComplete="off"
                      className="flex-1 text-sm text-black"
                      style={{ paddingVertical: 0 }}
                    />
                    <TouchableOpacity onPress={() => setShowNewPw((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      {showNewPw
                        ? <EyeOff size={16} color={Colors.textMuted} />
                        : <Eye size={16} color={Colors.textMuted} />
                      }
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className={`border border-gray-200 bg-white rounded-2xl py-4 items-center ${isChangingPassword ? "opacity-50" : ""}`}
                    onPress={handleChangePassword}
                    disabled={isChangingPassword}
                    activeOpacity={0.85}
                  >
                    {isChangingPassword
                      ? <ActivityIndicator color={Colors.textSecondary} />
                      : <Text className="text-sm font-semibold text-black">Change Password</Text>
                    }
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
