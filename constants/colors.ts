// Central color palette — new DrFit brand identity
// Primary: #C8EF2F (lime), Danger: #E8513A (red), Black/White only

export const Colors = {
  // Backgrounds
  background: "#F5F5F5",
  surface: "#FFFFFF",

  // Brand
  primary: "#C8EF2F",
  primaryLight: "#F0FAC0",
  primaryDark: "#A8CC1A",

  // Text
  textPrimary: "#000000",
  textSecondary: "#555555",
  textMuted: "#999999",
  textInverse: "#000000",   // text on lime background = black (high contrast)

  // Semantic
  danger: "#E8513A",
  dangerLight: "#FDECEA",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  info: "#2563EB",
  infoLight: "#DBEAFE",

  // UI
  border: "#E5E7EB",
  skeleton: "#F3F4F6",

  // Tab bar
  tabActive: "#C8EF2F",
  tabInactive: "#9CA3AF",
} as const;

// Reservation status color map
export const StatusColors = {
  active: { bg: "#F0FAC0", text: "#5A7A00" },
  completed: { bg: "#F3F4F6", text: "#555555" },
  cancelled: { bg: "#FDECEA", text: "#E8513A" },
  upcoming: { bg: "#DBEAFE", text: "#2563EB" },
} as const;
