// Central color palette — mirrors DESIGN_SYSTEM.md
// Import from here instead of hardcoding hex values in components.

export const Colors = {
  // Backgrounds
  background: "#F5F5F5",
  surface: "#FFFFFF",

  // Brand
  primary: "#16A34A",
  primaryLight: "#DCFCE7",
  primaryDark: "#15803D",

  // Text
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  textInverse: "#FFFFFF",

  // Semantic
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  info: "#2563EB",
  infoLight: "#DBEAFE",

  // UI
  border: "#E5E7EB",
  skeleton: "#F3F4F6",

  // Tab bar
  tabActive: "#16A34A",
  tabInactive: "#9CA3AF",
} as const;

// Reservation status color map
export const StatusColors = {
  active: { bg: "#DCFCE7", text: "#16A34A" },
  completed: { bg: "#F3F4F6", text: "#6B7280" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
  upcoming: { bg: "#DBEAFE", text: "#2563EB" },
} as const;
