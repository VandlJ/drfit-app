import { useState } from "react";
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
import { ChevronLeft, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/colors";

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      // Registered + authenticated — go to center picker
      router.replace("/(auth)/center-picker");
    } catch (err: any) {
      Alert.alert("Registration failed", err.message ?? "Please try again.");
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
          <View className="flex-1 px-6 justify-center gap-8 py-10">
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
                Create account
              </Text>
              <Text className="text-base text-gray-500">
                Join DrFit and start booking.
              </Text>
            </View>

            {/* Form */}
            <View className="gap-4">
              <TextInput
                label="Full name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                autoCapitalize="words"
                autoComplete="name"
                outlineColor={Colors.border}
                activeOutlineColor={Colors.textPrimary}
                style={{ backgroundColor: Colors.surface }}
              />
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

            {/* CTA */}
            <View className="gap-3">
              <TouchableOpacity
                className={`bg-primary rounded-full py-4 items-center ${isLoading ? "opacity-50" : ""}`}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                <Text className="text-black text-base font-semibold">
                  {isLoading ? "Creating account..." : "Create Account"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace("/(auth)/login")}
                activeOpacity={0.7}
              >
                <Text className="text-center text-xs text-gray-400">
                  Already have an account?{" "}
                  <Text className="text-black font-semibold underline">Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
