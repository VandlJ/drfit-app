import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import { MapPin, Check, X } from "lucide-react-native";
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
                  Vyber fitness centrum
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
                      activeOpacity={0.7}
                      className={`flex-row items-center gap-4 p-4 rounded-2xl border-2 ${
                        isSelected
                          ? "border-primary bg-green-50"
                          : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      {/* Pin icon */}
                      <View
                        className={`rounded-xl p-2.5 ${
                          isSelected ? "bg-primary-light" : "bg-gray-200"
                        }`}
                      >
                        <MapPin
                          size={20}
                          color={isSelected ? Colors.primary : Colors.textSecondary}
                        />
                      </View>

                      {/* Info */}
                      <View className="flex-1 gap-0.5">
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected ? "text-primary" : "text-gray-900"
                          }`}
                        >
                          {center.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {center.address}
                        </Text>
                      </View>

                      {/* Selection indicator */}
                      {isSelected && (
                        <View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
                          <Check size={12} color={Colors.textPrimary} strokeWidth={3} />
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
