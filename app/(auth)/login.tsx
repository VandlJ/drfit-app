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
import { Eye, EyeOff, ChevronLeft } from "lucide-react-native";
import { SymbolView } from "expo-symbols";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginWithBiometrics, token, isFaceIDEnabled } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) router.replace("/(tabs)");
  }, [token]);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert("Sign in failed", err.message ?? "Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFaceID() {
    setIsLoading(true);
    try {
      const success = await loginWithBiometrics();
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert("Face ID failed", "Please sign in with your password.");
      }
    } finally {
      setIsLoading(false);
    }
  }

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
          <View className="flex-1 px-6 gap-8 pt-10 pb-10">
            {/* Header */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="bg-white border border-gray-200 rounded-full w-9 h-9 items-center justify-center self-start mb-2"
                activeOpacity={0.7}
              >
                <ChevronLeft size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              <Text className="text-4xl font-unbounded text-black">
                DrFit
              </Text>
              <Text className="text-base text-gray-500">
                Sign in to your account
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
                activeOutlineColor={Colors.textPrimary}
                style={{ backgroundColor: Colors.surface }}
                theme={{ roundness: 14 }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                autoComplete="off"
                textContentType="oneTimeCode"
                outlineColor={Colors.border}
                activeOutlineColor={Colors.textPrimary}
                style={{ backgroundColor: Colors.surface }}
                theme={{ roundness: 14 }}
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

            {/* Actions */}
            <View className="gap-3">
              <TouchableOpacity
                className={`bg-primary rounded-full py-4 items-center ${isLoading ? "opacity-50" : ""}`}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text className="text-black text-base font-semibold">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Text>
              </TouchableOpacity>

              {isFaceIDEnabled && (
                <TouchableOpacity
                  className="bg-white border border-gray-200 rounded-full py-4 flex-row items-center justify-center gap-2"
                  onPress={handleFaceID}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <SymbolView name="faceid" size={22} tintColor={Colors.textSecondary} />
                  <Text className="text-black text-base font-semibold">
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
