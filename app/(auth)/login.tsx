import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import { ScanFace, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const { login, enableFaceID, isFaceIDEnabled, authenticateWithFaceID, token } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceIDPrompt, setShowFaceIDPrompt] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (token) router.replace("/(tabs)");
  }, [token]);

  // Attempt Face ID auto-login if enabled
  useEffect(() => {
    if (isFaceIDEnabled) {
      handleFaceIDLogin();
    }
  }, [isFaceIDEnabled]);

  async function handleFaceIDLogin() {
    const success = await authenticateWithFaceID();
    if (success) {
      router.replace("/(tabs)");
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      // First time login — ask about Face ID
      setShowFaceIDPrompt(true);
    } catch (err: any) {
      Alert.alert("Sign in failed", err.message ?? "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEnableFaceID() {
    await enableFaceID();
    setShowFaceIDPrompt(false);
    router.replace("/(tabs)");
  }

  function handleSkipFaceID() {
    setShowFaceIDPrompt(false);
    router.replace("/(tabs)");
  }

  // ── Face ID prompt overlay ────────────────────────────────────────────────
  if (showFaceIDPrompt) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-100">
        <View className="flex-1 px-6 justify-center items-center gap-6">
          <View className="bg-primary-light rounded-3xl p-6">
            <ScanFace size={48} color={Colors.primary} />
          </View>
          <View className="items-center gap-2">
            <Text className="text-2xl font-bold text-gray-900">
              Enable Face ID?
            </Text>
            <Text className="text-base text-gray-500 text-center">
              Sign in instantly next time with just a glance — no password
              needed.
            </Text>
          </View>
          <View className="w-full gap-3">
            <TouchableOpacity
              className="bg-primary rounded-full py-4 items-center"
              onPress={handleEnableFaceID}
              activeOpacity={0.85}
            >
              <Text className="text-white text-base font-semibold">
                Enable Face ID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-3 items-center"
              onPress={handleSkipFaceID}
            >
              <Text className="text-gray-500 text-sm">Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main login form ───────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 justify-center gap-8 py-10">
            {/* Header */}
            <View className="gap-2">
              <Text className="text-3xl font-bold text-gray-900">
                Welcome back
              </Text>
              <Text className="text-base text-gray-500">
                Sign in to your DrFit account
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                style={{ backgroundColor: Colors.surface }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                outlineColor={Colors.border}
                activeOutlineColor={Colors.primary}
                style={{ backgroundColor: Colors.surface }}
                right={
                  <TextInput.Icon
                    icon={() =>
                      showPassword ? (
                        <EyeOff size={20} color={Colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={Colors.textSecondary} />
                      )
                    }
                    onPress={() => setShowPassword((v) => !v)}
                  />
                }
              />
            </View>

            {/* Hint */}
            <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <Text className="text-xs text-green-700">
                Demo: john.doe@example.com / password123
              </Text>
            </View>

            {/* Actions */}
            <View className="gap-3">
              <TouchableOpacity
                className={`bg-primary rounded-full py-4 items-center ${isLoading ? "opacity-50" : ""}`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text className="text-white text-base font-semibold">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              {isFaceIDEnabled && (
                <TouchableOpacity
                  className="flex-row items-center justify-center gap-2 py-3"
                  onPress={handleFaceIDLogin}
                >
                  <ScanFace size={20} color={Colors.primary} />
                  <Text className="text-primary text-sm font-medium">
                    Sign in with Face ID
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
