import { useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, CalendarPlus, Wallet, Clock, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const TAB_ICONS = [Home, CalendarPlus, Wallet, Clock, Settings];
const TAB_COUNT = TAB_ICONS.length;
const BAR_HEIGHT = 64;
const SQUARE_SIZE = 46;

function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabWidth = width / TAB_COUNT;

  const squareX = useRef(
    new Animated.Value(state.index * tabWidth + (tabWidth - SQUARE_SIZE) / 2)
  ).current;

  useEffect(() => {
    Animated.spring(squareX, {
      toValue: state.index * tabWidth + (tabWidth - SQUARE_SIZE) / 2,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    }).start();
  }, [state.index, tabWidth]);

  return (
    <View
      style={{
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        height: BAR_HEIGHT + insets.bottom,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Sliding lime square */}
      <Animated.View
        style={{
          position: "absolute",
          top: (BAR_HEIGHT - SQUARE_SIZE) / 2,
          left: 0,
          width: SQUARE_SIZE,
          height: SQUARE_SIZE,
          backgroundColor: Colors.primary,
          borderRadius: 12,
          transform: [{ translateX: squareX }],
        }}
      />

      {/* Tab buttons */}
      <View style={{ flexDirection: "row", height: BAR_HEIGHT }}>
        {state.routes.map((route, index) => {
          const Icon = TAB_ICONS[index];
          const focused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={22}
                color={focused ? Colors.textPrimary : Colors.tabInactive}
                strokeWidth={focused ? 2.5 : 2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { token, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && token === null) {
      router.replace("/(auth)/onboarding");
    }
  }, [token, isLoading]);

  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="booking" />
      <Tabs.Screen name="credits" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
