import { View, Text, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import type { CreditPackage } from "@/constants/types";

interface CreditPackageCardProps {
  pkg: CreditPackage;
  isSelected: boolean;
  onPress: () => void;
}

export default function CreditPackageCard({
  pkg,
  isSelected,
  onPress,
}: CreditPackageCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`
        rounded-2xl p-5 border-2 gap-3
        ${isSelected ? "border-primary bg-primary" : "border-gray-100 bg-white"}
        ${pkg.highlight && !isSelected ? "border-primary/30 bg-green-50/50" : ""}
      `}
    >
      {/* Top row: label + check */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text
            className={`text-base font-bold ${isSelected ? "text-white" : "text-gray-900"}`}
          >
            {pkg.label}
          </Text>
          {pkg.highlight && !isSelected && (
            <View className="bg-primary rounded-full px-2 py-0.5">
              <Text className="text-[10px] text-white font-semibold uppercase tracking-wide">
                Best Value
              </Text>
            </View>
          )}
        </View>
        {isSelected && (
          <View className="bg-white/25 rounded-full w-6 h-6 items-center justify-center">
            <Check size={14} color="#fff" strokeWidth={3} />
          </View>
        )}
      </View>

      {/* Credits */}
      <View className="gap-1">
        <Text
          className={`text-3xl font-bold tracking-tight ${
            isSelected ? "text-white" : "text-gray-900"
          }`}
        >
          {pkg.credits.toLocaleString()}
          <Text
            className={`text-base font-medium ${
              isSelected ? "text-white/70" : "text-gray-400"
            }`}
          >
            {" "}cr
          </Text>
        </Text>
        {pkg.bonusCredits > 0 && (
          <Text
            className={`text-sm font-medium ${
              isSelected ? "text-white/80" : "text-primary"
            }`}
          >
            +{pkg.bonusCredits} bonus credits
          </Text>
        )}
      </View>

      {/* Price */}
      <View className="flex-row items-baseline justify-between">
        <Text
          className={`text-xl font-bold ${
            isSelected ? "text-white" : "text-gray-900"
          }`}
        >
          {pkg.priceKc.toLocaleString()} Kč
        </Text>
        {pkg.bonusCredits > 0 && (
          <Text
            className={`text-xs ${isSelected ? "text-white/60" : "text-gray-400"}`}
          >
            {pkg.totalCredits.toLocaleString()} total
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
