import { useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, useWindowDimensions } from "react-native";
import { Tabs, useRouter } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, CalendarPlus, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";

const TAB_ICONS: Record<string, typeof Home> = {
  index: Home,
  booking: CalendarPlus,
  settings: Settings,
};
const TAB_ORDER = ["index", "booking", "settings"];
const PRIMARY_TAB = "booking";
const TAB_COUNT = TAB_ORDER.length;

const BAR_HEIGHT = 64;
const PRIMARY_ICON_SIZE = 28;
const DEFAULT_ICON_SIZE = 24;
const DOT_SIZE = 5;

function AnimatedTabBar({ state, navigation }: BottomTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabWidth = width / TAB_COUNT;

  // Only render routes that should appear in the bar.
  const visibleRoutes = state.routes.filter((r) => TAB_ORDER.includes(r.name));
  const focusedRouteName = state.routes[state.index]?.name;
  const visibleIndex = Math.max(
    0,
    visibleRoutes.findIndex((r) => r.name === focusedRouteName)
  );

  // Sliding lime dot under the active icon.
  const dotX = useRef(
    new Animated.Value(visibleIndex * tabWidth + tabWidth / 2 - DOT_SIZE / 2)
  ).current;

  useEffect(() => {
    Animated.spring(dotX, {
      toValue: visibleIndex * tabWidth + tabWidth / 2 - DOT_SIZE / 2,
      useNativeDriver: false,
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    }).start();
  }, [visibleIndex, tabWidth]);

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
      {/* Tab buttons */}
      <View style={{ flexDirection: "row", height: BAR_HEIGHT }}>
        {visibleRoutes.map((route) => {
          const Icon = TAB_ICONS[route.name];
          const focused = route.name === focusedRouteName;
          const isPrimary = route.name === PRIMARY_TAB;
          const iconSize = isPrimary ? PRIMARY_ICON_SIZE : DEFAULT_ICON_SIZE;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                size={iconSize}
                color={focused ? Colors.textPrimary : Colors.tabInactive}
                strokeWidth={focused ? 2.5 : 2}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sliding lime dot indicator */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: insets.bottom + 8,
          left: 0,
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: Colors.primary,
          transform: [{ translateX: dotX }],
        }}
      />
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
      <Tabs.Screen name="credits" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
