import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import CreditPackageCard from "@/components/CreditPackageCard";
import { useData } from "@/context/DataContext";
import { CREDIT_PACKAGES } from "@/constants/mock";
import { Colors } from "@/constants/colors";
import type { CreditPackage } from "@/constants/types";

// Lazy import Apple Pay so the module failure (Expo Go) doesn't crash the screen.
// We try/catch at hook call time below.
let usePlatformPay: any = null;
let PlatformPayButton: any = null;
let PlatformPay: any = null;

try {
  const stripe = require("@stripe/stripe-react-native");
  usePlatformPay = stripe.usePlatformPay;
  PlatformPayButton = stripe.PlatformPayButton;
  PlatformPay = stripe.PlatformPay;
} catch {
  // Running in Expo Go — Stripe native module not available
}

export default function TopUpScreen() {
  const router = useRouter();
  const { topUpCredits } = useData();
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage>(
    CREDIT_PACKAGES.find((p) => p.highlight) ?? CREDIT_PACKAGES[1]
  );
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Safe hook call — only works in a dev build with Stripe native module
  let platformPayHook: ReturnType<typeof usePlatformPay> | null = null;
  try {
    if (usePlatformPay) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      platformPayHook = usePlatformPay();
    }
  } catch {
    // Not available in Expo Go
  }

  useEffect(() => {
    if (!platformPayHook) return;
    platformPayHook
      .isPlatformPaySupported()
      .then((supported: boolean) => setApplePayAvailable(supported))
      .catch(() => {});
  }, []);

  async function handleApplePay() {
    if (!platformPayHook) return;
    setIsProcessing(true);

    try {
      const { error, paymentMethod } =
        await platformPayHook.createPlatformPayPaymentMethod({
          applePay: {
            cartItems: [
              {
                label: `DrFit ${selectedPkg.label} Pack`,
                amount: (selectedPkg.priceKc / 100).toFixed(2), // Stripe expects decimal string
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
            merchantCountryCode: "CZ",
            currencyCode: "CZK",
          },
        });

      if (error) {
        if (error.code === "Canceled") return; // user dismissed sheet — not an error
        Alert.alert("Payment failed", error.message ?? "Please try again.");
        return;
      }

      // In production: send paymentMethod.id to backend → confirm intent
      // For MVP: optimistically credit the account
      await topUpCredits(selectedPkg);
      Alert.alert(
        "Payment successful!",
        `${selectedPkg.totalCredits.toLocaleString()} credits added to your account.`,
        [{ text: "Great!", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Unexpected error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  // Fallback for Expo Go / devices without Apple Pay
  async function handleSimulatedPayment() {
    setIsProcessing(true);
    try {
      // Simulate a brief network delay
      await new Promise((r) => setTimeout(r, 800));
      await topUpCredits(selectedPkg);
      Alert.alert(
        "Credits added!",
        `${selectedPkg.totalCredits.toLocaleString()} credits added to your account.`,
        [{ text: "Done", onPress: () => router.back() }]
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-4 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              className="bg-white border border-gray-200 rounded-full w-9 h-9 items-center justify-center"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <ChevronLeft size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text className="text-xl font-unbounded text-black">
              Top Up
            </Text>
          </View>

          {/* Package selection */}
          <View className="gap-3">
            <Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Select Package
            </Text>
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackageCard
                key={pkg.id}
                pkg={pkg}
                isSelected={selectedPkg.id === pkg.id}
                onPress={() => setSelectedPkg(pkg)}
              />
            ))}
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-5 gap-3 border border-gray-100">
            <Text className="text-sm font-semibold text-gray-900">
              Order Summary
            </Text>
            <View className="h-px bg-gray-100" />
            <Row label="Credits" value={`${selectedPkg.credits.toLocaleString()} cr`} />
            {selectedPkg.bonusCredits > 0 && (
              <Row
                label="Bonus"
                value={`+${selectedPkg.bonusCredits} cr`}
                valueStyle="text-primary"
              />
            )}
            <View className="h-px bg-gray-100" />
            <Row
              label="Total"
              value={`${selectedPkg.priceKc.toLocaleString()} Kč`}
              labelStyle="font-semibold text-gray-900"
              valueStyle="font-bold text-gray-900"
            />
          </View>

          {/* Payment buttons */}
          <View className="gap-3">
            {/* Apple Pay — only rendered in dev build when supported */}
            {applePayAvailable && PlatformPayButton && (
              <PlatformPayButton
                onPress={handleApplePay}
                type={PlatformPay?.ButtonType?.Pay}
                appearance={PlatformPay?.ButtonStyle?.Black}
                style={{ width: "100%", height: 54, borderRadius: 100 }}
                disabled={isProcessing}
              />
            )}

            {/* Simulated payment fallback (always shown in Expo Go, also shown when Apple Pay unavailable) */}
            {!applePayAvailable && (
              <TouchableOpacity
                className={`rounded-full py-4 items-center ${
                  isProcessing ? "bg-gray-200" : "bg-primary"
                }`}
                onPress={handleSimulatedPayment}
                disabled={isProcessing}
                activeOpacity={0.85}
              >
                <Text
                  className={`text-base font-semibold ${
                    isProcessing ? "text-gray-400" : "text-black"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : `Pay ${selectedPkg.priceKc.toLocaleString()} Kč`}
                </Text>
              </TouchableOpacity>
            )}

            <Text className="text-[11px] text-gray-400 text-center">
              Payments are processed securely via Stripe.{"\n"}1 credit = 1 Kč
              of gym access.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  labelStyle,
  valueStyle,
}: {
  label: string;
  value: string;
  labelStyle?: string;
  valueStyle?: string;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className={`text-sm text-gray-500 ${labelStyle ?? ""}`}>
        {label}
      </Text>
      <Text className={`text-sm text-gray-900 ${valueStyle ?? ""}`}>
        {value}
      </Text>
    </View>
  );
}
