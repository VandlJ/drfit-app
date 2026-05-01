import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import TransactionItem from "@/components/TransactionItem";
import { useData } from "@/context/DataContext";
import { Colors } from "@/constants/colors";

export default function CreditsScreen() {
  const router = useRouter();
  const { creditBalance, transactions } = useData();

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="flex-row items-end justify-between">
            <View className="gap-0.5">
              <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                DrFit
              </Text>
              <Text className="text-2xl font-bold text-gray-900">Credits</Text>
            </View>
          </View>

          {/* Balance card */}
          <View className="bg-primary rounded-3xl p-6 gap-1">
            <Text className="text-white/70 text-sm font-medium">
              Your balance
            </Text>
            <Text className="text-white text-5xl font-bold tracking-tight">
              {creditBalance.toLocaleString()}
            </Text>
            <Text className="text-white/60 text-sm">credits</Text>

            <View className="mt-4">
              <TouchableOpacity
                className="bg-white rounded-full py-3 px-6 flex-row items-center gap-2 self-start"
                onPress={() => router.push("/(tabs)/credits/topup")}
                activeOpacity={0.85}
              >
                <Plus size={16} color={Colors.primary} strokeWidth={2.5} />
                <Text className="text-primary text-sm font-semibold">
                  Top Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Transaction history */}
          <View className="gap-3">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Transaction History
            </Text>

            {transactions.length === 0 ? (
              <View className="bg-white rounded-2xl px-4 py-8 items-center border border-gray-100">
                <Text className="text-gray-400 text-sm">No transactions yet.</Text>
              </View>
            ) : (
              <View className="bg-white rounded-2xl px-4 border border-gray-100">
                {transactions.map((tx) => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
