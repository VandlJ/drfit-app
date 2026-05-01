import { useState } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from "react-native";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, MapPin, Clock, Eye } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useData } from "@/context/DataContext";
import { apiGetReservationPin } from "@/lib/api";
import type { Reservation } from "@/constants/types";
import { formatDate } from "@/constants/types";

interface BookingCardProps {
  reservation: Reservation;
  onPress?: () => void;
  /** When true, render with a NEXT SESSION badge + Show PIN button instead of chevron */
  isNext?: boolean;
}

// Deterministic Unsplash gym photos used as fallback when the backend
// does not provide an `imageUrl` for a center. Picked for vivid colors
// (no monochrome / desaturated shots).
const FALLBACK_GYM_IMAGES = [
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800&q=80", // colorful neon gym
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&q=80", // bright gym with windows
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", // dumbbell rack
  "https://images.unsplash.com/photo-1623874514711-0f321325f318?w=800&q=80", // boutique gym colorful
];

function pickFallbackImage(centerId: string): string {
  let hash = 0;
  for (let i = 0; i < centerId.length; i++) {
    hash = (hash * 31 + centerId.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GYM_IMAGES[hash % FALLBACK_GYM_IMAGES.length];
}

export default function BookingCard({ reservation, onPress, isNext = false }: BookingCardProps) {
  const { slot, centerName, centerId } = reservation;
  const { centers } = useData();
  const center = centers.find((c) => c.id === centerId);
  const imageUrl = center?.imageUrl ?? pickFallbackImage(centerId);
  const [fetchedPin, setFetchedPin] = useState<string | null>(null);
  const [isFetchingPin, setIsFetchingPin] = useState(false);

  async function handleShowPin(e?: any) {
    e?.stopPropagation?.();
    let pin = fetchedPin;
    // Fake dev reservation — backend doesn't know it, use embedded pin
    if (!pin && reservation.id.startsWith("dev-fake")) {
      pin = reservation.pin ?? null;
    }
    if (!pin) {
      setIsFetchingPin(true);
      try {
        const data = await apiGetReservationPin(reservation.id);
        pin = data.pin;
        setFetchedPin(pin);
      } catch (err) {
        console.log("[BookingCard] PIN fetch failed:", err);
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

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={`rounded-2xl overflow-hidden ${isNext ? "" : "border border-gray-100"}`}
      style={{ height: isNext ? 220 : 180, backgroundColor: Colors.primary }}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={{ flex: 1, justifyContent: "space-between" }}
        resizeMode="cover"
      >
        {/* Bottom-fading gradient — lime brand color, stronger to keep text readable */}
        <LinearGradient
          colors={["rgba(200,239,47,0)", "rgba(200,239,47,1)"]}
          locations={[0, 0.55]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "85%",
          }}
        />

        {/* Top row — NEXT badge (only on next card) keeps the layout symmetric;
            we always render an empty spacer so `space-between` pushes content down. */}
        <View className="px-4 pt-4">
          {isNext ? (
            <View className="self-start bg-black rounded-full px-3 py-1">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-white">
                Next Session
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>

        {/* Bottom content */}
        <View className="px-4 pb-4 pt-12">
          <View className="flex-row items-end justify-between mb-2">
            <View className="gap-1 flex-1">
              <View className="flex-row items-center gap-1">
                <MapPin size={11} color={Colors.textPrimary} />
                <Text className="text-[11px] font-semibold text-black" numberOfLines={1}>
                  {centerName}
                </Text>
              </View>
              <Text className="text-base font-bold text-black" numberOfLines={1}>
                {formatDate(slot.date)}
              </Text>
              <View className="flex-row items-center gap-1">
                <Clock size={11} color={Colors.textPrimary} />
                <Text className="text-xs font-medium text-black/80">
                  {slot.startTime} – {slot.endTime}
                </Text>
              </View>
            </View>

            {!isNext && (
              <View className="bg-black rounded-full w-8 h-8 items-center justify-center">
                <ChevronRight size={16} color="#fff" />
              </View>
            )}
          </View>

          {/* Show PIN button — only on the next card */}
          {isNext && (
            <TouchableOpacity
              onPress={handleShowPin}
              activeOpacity={0.85}
              disabled={isFetchingPin}
              className="flex-row items-center justify-center gap-2 bg-black rounded-xl py-3 mt-1"
            >
              {isFetchingPin ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Eye size={14} color="#fff" />
                  <Text className="text-sm font-semibold text-white">Show PIN</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}
