import { View, Text } from "react-native";
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Gift } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import type { CreditTransaction } from "@/constants/types";

interface TransactionItemProps {
  tx: CreditTransaction;
}

const TYPE_CONFIG = {
  topup: {
    icon: ArrowDownLeft,
    bg: "bg-primary-light",
    iconColor: Colors.textPrimary,
    amountPrefix: "+",
    amountColor: Colors.textPrimary,
  },
  spend: {
    icon: ArrowUpRight,
    bg: "bg-gray-100",
    iconColor: Colors.textSecondary,
    amountPrefix: "",
    amountColor: Colors.textPrimary,
  },
  refund: {
    icon: RotateCcw,
    bg: "bg-blue-100",
    iconColor: Colors.info,
    amountPrefix: "+",
    amountColor: Colors.info,
  },
  bonus: {
    icon: Gift,
    bg: "bg-yellow-100",
    iconColor: Colors.warning,
    amountPrefix: "+",
    amountColor: Colors.warning,
  },
} as const;

function formatRelativeDate(isoString: string): string {
  const d = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TransactionItem({ tx }: TransactionItemProps) {
  const config = TYPE_CONFIG[tx.type];
  const Icon = config.icon;
  const absAmount = Math.abs(tx.amount);
  const prefix = tx.amount > 0 ? "+" : "−";

  return (
    <View className="flex-row items-center gap-3 py-3.5 border-b border-gray-100">
      {/* Icon */}
      <View
        className={`${config.bg} rounded-xl w-10 h-10 items-center justify-center`}
      >
        <Icon size={18} color={config.iconColor} strokeWidth={2} />
      </View>

      {/* Description */}
      <View className="flex-1 gap-0.5">
        <Text
          className="text-sm font-medium text-black"
          numberOfLines={1}
        >
          {tx.description}
        </Text>
        <Text className="text-xs text-gray-400">
          {formatRelativeDate(tx.createdAt)}
        </Text>
      </View>

      {/* Amount */}
      <Text
        className="text-sm font-semibold"
        style={{ color: config.amountColor }}
      >
        {prefix}{absAmount.toLocaleString()} cr
      </Text>
    </View>
  );
}
