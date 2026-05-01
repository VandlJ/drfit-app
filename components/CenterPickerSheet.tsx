import { Modal, View, Text, TouchableOpacity, Pressable } from "react-native";
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

export default function CenterPickerSheet({
  visible,
  centers,
  selectedCenterId,
  onSelect,
  onClose,
}: CenterPickerSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Tap-outside backdrop */}
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        {/* Sheet — stop propagation so taps inside don't close */}
        <Pressable onPress={(e) => e.stopPropagation()}>
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
                        <Check size={12} color="#fff" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
