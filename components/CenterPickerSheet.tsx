import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import type { Center } from "@/constants/types";

interface CenterPickerSheetProps {
  visible: boolean;
  centers: Center[];
  selectedCenterId: string;
  onSelect: (center: Center) => void;
  onClose: () => void;
}

const SHEET_HEIGHT = 300; // approx slide distance
const ROW_HEIGHT = 80;
const PHOTO_WIDTH = 80;

// Same deterministic Unsplash fallback used by BookingCard so each center
// always shows the same photo across the app.
const FALLBACK_GYM_IMAGES = [
  "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=80",
  "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80",
  "https://images.unsplash.com/photo-1623874514711-0f321325f318?w=400&q=80",
];

function pickFallbackImage(centerId: string): string {
  let hash = 0;
  for (let i = 0; i < centerId.length; i++) {
    hash = (hash * 31 + centerId.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GYM_IMAGES[hash % FALLBACK_GYM_IMAGES.length];
}

/**
 * Square center thumbnail. Tries the provided URL first; on load failure
 * (or when no URL is provided) falls back to a deterministic Unsplash gym photo.
 */
function CenterThumb({ center, size }: { center: Center; size: number }) {
  const fallback = pickFallbackImage(center.id);
  const initial =
    center.imageUrl && center.imageUrl.length > 0 ? center.imageUrl : fallback;
  const [uri, setUri] = useState<string>(initial);

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, backgroundColor: "#E5E7EB" }}
      resizeMode="cover"
      onError={() => {
        if (uri !== fallback) {
          console.log("[CenterThumb] image failed, falling back:", uri);
          setUri(fallback);
        }
      }}
    />
  );
}

export default function CenterPickerSheet({
  visible,
  centers,
  selectedCenterId,
  onSelect,
  onClose,
}: CenterPickerSheetProps) {
  // Keep modal mounted during the exit animation
  const [modalMounted, setModalMounted] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setModalMounted(false));
    }
  }, [visible]);

  return (
    <Modal
      visible={modalMounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Fading backdrop */}
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

      {/* Full-screen flex container — tap empty area to close */}
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        {/* Sliding sheet */}
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <Pressable>
            <View className="bg-white rounded-t-3xl px-6 pt-5 pb-10">
              {/* Drag handle */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              {/* Header */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-gray-900">
                  Select Location
                </Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center"
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <X size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Center list */}
              <View className="gap-3">
                {centers.map((center) => {
                  const isSelected = center.id === selectedCenterId;
                  return (
                    <TouchableOpacity
                      key={center.id}
                      onPress={() => {
                        onSelect(center);
                        onClose();
                      }}
                      activeOpacity={0.85}
                      className={`flex-row items-stretch rounded-2xl overflow-hidden border-2 bg-white ${
                        isSelected ? "border-primary" : "border-gray-100"
                      }`}
                      style={{ height: ROW_HEIGHT }}
                    >
                      {/* Square photo flush to the left edge with a horizontal
                          white gradient that fades the right side of the photo
                          into the white row background. */}
                      <View
                        style={{
                          width: PHOTO_WIDTH,
                          height: ROW_HEIGHT,
                          position: "relative",
                        }}
                      >
                        <CenterThumb center={center} size={PHOTO_WIDTH} />
                        <LinearGradient
                          colors={[
                            "rgba(255,255,255,0)",
                            "rgba(255,255,255,1)",
                          ]}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 0.5 }}
                          style={{
                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            left: PHOTO_WIDTH * 0.4,
                            width: PHOTO_WIDTH * 0.6,
                          }}
                        />
                      </View>

                      {/* Info */}
                      <View className="flex-1 justify-center px-4 gap-0.5">
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? "text-black" : "text-gray-900"
                          }`}
                          numberOfLines={1}
                        >
                          {center.name}
                        </Text>
                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                          {center.address}
                        </Text>
                      </View>

                      {/* Selection indicator */}
                      {isSelected && (
                        <View className="justify-center pr-5">
                          <View className="bg-primary rounded-full w-6 h-6 items-center justify-center">
                            <Check size={14} color={Colors.textPrimary} strokeWidth={3} />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}
