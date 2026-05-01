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
  Dimensions,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  CalendarDays,
  Clock,
  MapPin,
  Wallet,
  X,
  Trash2,
  Eye,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { formatDate } from "@/constants/types";
import { apiGetReservationPin } from "@/lib/api";
import type { Reservation } from "@/constants/types";

interface ReservationDetailSheetProps {
  reservation: Reservation | null;
  visible: boolean;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function ReservationDetailSheet({
  reservation,
  visible,
  onClose,
  onCancel,
}: ReservationDetailSheetProps) {
  const [modalMounted, setModalMounted] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [isFetchingPin, setIsFetchingPin] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      // Reset to off-screen before each open so animation always plays
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
      setModalMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => setModalMounted(false));
    }
  }, [visible]);

  // Reset PIN whenever a new reservation opens
  useEffect(() => {
    setFetchedPin(null);
  }, [reservation?.id]);

  async function handleShowPin() {
    if (!reservation) return;
    let pin = fetchedPin;
    if (!pin) {
      setIsFetchingPin(true);
      try {
        const data = await apiGetReservationPin(reservation.id);
        pin = data.pin;
        setFetchedPin(pin);
      } catch (err) {
        console.log("[ReservationDetailSheet] PIN fetch failed:", err);
        Alert.alert("PIN unavailable", "Your PIN will be available closer to the session.");
        setIsFetchingPin(false);
        return;
      }
      setIsFetchingPin(false);
    }
    Alert.alert("Entry PIN", pin, [
      {
        text: "Copy",
        onPress: async () => {
          await Clipboard.setStringAsync(pin!);
        },
      },
      { text: "Done", style: "cancel" },
    ]);
  }

  async function handleCopyPin() {
    const pin = fetchedPin ?? reservation?.pin;
    if (!pin) return;
    await Clipboard.setStringAsync(pin);
  }

  const handleCancel = () => {
    if (!reservation) return;
    Alert.alert(
      "Cancel Session",
      "Are you sure you want to cancel this session? Your credits will be refunded.",
      [
        { text: "Keep it", style: "cancel" },
        {
          text: "Cancel Session",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await onCancel(reservation.id);
              onClose();
            } catch {
              Alert.alert("Error", "Could not cancel the session. Please try again.");
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (!reservation) return null;

  const { slot, centerName, centerAddress, creditsSpent } = reservation;

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          opacity: fadeAnim,
        }}
      />

      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable>
            <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
              {/* Drag handle */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-lg font-bold text-gray-900">
                  Session Details
                </Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Details rows */}
              <View className="gap-4 mb-8">
                {/* Date */}
                <View className="flex-row items-center gap-3">
                  <CalendarDays size={22} color={Colors.textSecondary} strokeWidth={1.75} />
                  <Text className="text-base font-semibold text-gray-900">
                    {formatDate(slot.date)}
                  </Text>
                </View>

                {/* Time */}
                <View className="flex-row items-center gap-3">
                  <Clock size={22} color={Colors.textSecondary} strokeWidth={1.75} />
                  <Text className="text-base font-semibold text-gray-900">
                    {slot.startTime} – {slot.endTime}
                  </Text>
                </View>

                {/* Location */}
                <View className="flex-row items-start gap-3">
                  <MapPin size={22} color={Colors.textSecondary} strokeWidth={1.75} style={{ marginTop: 2 }} />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {centerName || "DrFit Center"}
                    </Text>
                    {!!centerAddress && centerAddress !== "—" && (
                      <Text className="text-xs text-gray-400 mt-0.5">{centerAddress}</Text>
                    )}
                  </View>
                </View>

                {/* Credits */}
                <View className="flex-row items-center gap-3">
                  <Wallet size={22} color={Colors.textSecondary} strokeWidth={1.75} />
                  <Text className="text-base font-semibold text-gray-900">
                    {creditsSpent} credits
                  </Text>
                </View>
              </View>

              {/* Action buttons */}
              <View className="flex-row gap-3">
                {/* Show PIN */}
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-center gap-2 bg-black rounded-2xl py-4"
                  onPress={handleShowPin}
                  activeOpacity={0.85}
                  disabled={isFetchingPin}
                >
                  {isFetchingPin ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Eye size={16} color="#fff" />
                      <Text className="text-sm font-semibold text-white">
                        Show PIN
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Cancel session */}
                <TouchableOpacity
                  className={`flex-1 flex-row items-center justify-center gap-2 bg-red-500 rounded-2xl py-4 ${cancelling ? "opacity-50" : ""}`}
                  onPress={handleCancel}
                  activeOpacity={0.85}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Trash2 size={16} color="#fff" />
                      <Text className="text-sm font-semibold text-white">
                        Cancel
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
