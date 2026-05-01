# Design System: DrFit App

## Overview
Light premium fitness aesthetic. Clean white surfaces, bold green primary, high contrast typography.
Target: iOS-first, native feel, premium but approachable.

---

## Color Palette

### Semantic Roles

| Token | Hex | Tailwind Class | Usage |
|---|---|---|---|
| `background` | `#F5F5F5` | `bg-neutral-100` | App background, screen bg |
| `surface` | `#FFFFFF` | `bg-white` | Cards, modals, inputs |
| `surface-elevated` | `#FFFFFF` | `bg-white` | Elevated cards (shadow) |
| `primary` | `#16A34A` | `bg-green-600` | CTA buttons, active states, accents |
| `primary-light` | `#DCFCE7` | `bg-green-100` | Pill backgrounds, subtle highlights |
| `primary-dark` | `#15803D` | `bg-green-700` | Pressed states, hover |
| `text-primary` | `#111827` | `text-gray-900` | Headings, body copy |
| `text-secondary` | `#6B7280` | `text-gray-500` | Subtitles, labels, captions |
| `text-muted` | `#9CA3AF` | `text-gray-400` | Placeholder text, disabled |
| `text-inverse` | `#FFFFFF` | `text-white` | Text on dark/green backgrounds |
| `border` | `#E5E7EB` | `border-gray-200` | Card borders, input borders, dividers |
| `danger` | `#DC2626` | `text-red-600` / `bg-red-600` | Cancel, delete, error states |
| `danger-light` | `#FEE2E2` | `bg-red-100` | Danger pill backgrounds |
| `warning` | `#D97706` | `text-amber-600` | Warnings, expiring states |
| `warning-light` | `#FEF3C7` | `bg-amber-100` | Warning pill backgrounds |
| `success` | `#16A34A` | `text-green-600` | Success states (same as primary) |
| `info` | `#2563EB` | `text-blue-600` | Informational states |
| `overlay` | `rgba(0,0,0,0.5)` | — | Modal overlays |
| `skeleton` | `#F3F4F6` | `bg-gray-100` | Loading skeleton backgrounds |

### Status Colors (Reservation States)

| State | Background | Text | Tailwind |
|---|---|---|---|
| `active` | `#DCFCE7` | `#16A34A` | `bg-green-100 text-green-700` |
| `completed` | `#F3F4F6` | `#6B7280` | `bg-gray-100 text-gray-500` |
| `cancelled` | `#FEE2E2` | `#DC2626` | `bg-red-100 text-red-600` |
| `upcoming` | `#DBEAFE` | `#2563EB` | `bg-blue-100 text-blue-600` |

---

## Typography

All fonts are system defaults (San Francisco on iOS). No custom font loading.

### Scale

| Name | Size | Weight | Line Height | Tailwind | Usage |
|---|---|---|---|---|---|
| `display` | 32px | 700 | 40px | `text-3xl font-bold` | Hero numbers (PIN, timer, balance) |
| `heading-1` | 24px | 700 | 32px | `text-2xl font-bold` | Screen titles |
| `heading-2` | 20px | 600 | 28px | `text-xl font-semibold` | Section headings, card titles |
| `heading-3` | 17px | 600 | 24px | `text-[17px] font-semibold` | Subsection titles |
| `body-lg` | 16px | 400 | 24px | `text-base` | Primary body text |
| `body` | 14px | 400 | 20px | `text-sm` | Secondary body, list items |
| `caption` | 12px | 400 | 16px | `text-xs` | Labels, captions, metadata |
| `overline` | 11px | 600 | 16px | `text-[11px] font-semibold uppercase tracking-wider` | Section overlines, tags |

### Usage Rules
- Use `font-bold` only for hero numbers and screen titles
- Body text is always `text-gray-900` on white, `text-gray-500` for secondary
- Never use more than 2 font weights on a single screen
- Letter spacing: only on `overline` style (`tracking-wider`)

---

## Spacing & Layout

### Base unit: 4px (Tailwind default)

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `xs` | 4px | `p-1` / `gap-1` | Icon margins, tight spacing |
| `sm` | 8px | `p-2` / `gap-2` | Compact elements |
| `md` | 12px | `p-3` / `gap-3` | Default inner padding |
| `lg` | 16px | `p-4` / `gap-4` | Card padding, section gaps |
| `xl` | 20px | `p-5` / `gap-5` | Large section padding |
| `2xl` | 24px | `p-6` / `gap-6` | Screen horizontal padding |
| `3xl` | 32px | `p-8` / `gap-8` | Hero section padding |

### Screen Layout
- **Horizontal padding:** `px-6` (24px) on all screens
- **Top padding (below safe area):** `pt-4`
- **Section gap:** `gap-6` (24px) between major sections
- **Tab bar:** handled by Expo Router — no manual padding needed at bottom

### Border Radius

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `sm` | 8px | `rounded-lg` | Inputs, small pills |
| `md` | 12px | `rounded-xl` | Cards, modals |
| `lg` | 16px | `rounded-2xl` | Hero cards, bottom sheets |
| `full` | 9999px | `rounded-full` | Buttons, badge pills |

---

## Component Patterns

### Buttons

#### Primary Button
```tsx
<TouchableOpacity className="bg-green-600 rounded-full py-4 items-center">
  <Text className="text-white text-base font-semibold">Book Session</Text>
</TouchableOpacity>
```

#### Secondary Button (outlined)
```tsx
<TouchableOpacity className="border border-green-600 rounded-full py-4 items-center">
  <Text className="text-green-600 text-base font-semibold">View Details</Text>
</TouchableOpacity>
```

#### Danger Button
```tsx
<TouchableOpacity className="bg-red-600 rounded-full py-4 items-center">
  <Text className="text-white text-base font-semibold">Cancel Booking</Text>
</TouchableOpacity>
```

#### Ghost Button (text only)
```tsx
<TouchableOpacity className="py-2 items-center">
  <Text className="text-gray-500 text-sm">Skip</Text>
</TouchableOpacity>
```

#### Disabled state: add `opacity-50` class

### Cards

#### Standard Card
```tsx
<View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
  {/* content */}
</View>
```

#### Hero Card (large, prominent)
```tsx
<View className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
  {/* content */}
</View>
```

#### Shadow values (iOS):
- `shadow-sm` → `shadowOffset: {0,1}, shadowOpacity: 0.05, shadowRadius: 3`
- `shadow-md` → `shadowOffset: {0,2}, shadowOpacity: 0.10, shadowRadius: 8`

### Inputs

Use React Native Paper `TextInput` with NativeWind wrapper:
```tsx
<TextInput
  mode="outlined"
  outlineColor="#E5E7EB"
  activeOutlineColor="#16A34A"
  style={{ backgroundColor: 'white' }}
  // ...
/>
```

### Pills / Badges
```tsx
// Status pill
<View className="bg-green-100 rounded-full px-3 py-1 self-start">
  <Text className="text-green-700 text-xs font-semibold">Active</Text>
</View>
```

### Dividers
```tsx
<View className="h-px bg-gray-200 my-4" />
```

### Section Header
```tsx
<Text className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
  Upcoming Sessions
</Text>
```

---

## Icons

Library: **Lucide React Native** (`lucide-react-native`)

### Standard Icon Sizes

| Context | Size | Color |
|---|---|---|
| Tab bar (inactive) | 24px | `#9CA3AF` (gray-400) |
| Tab bar (active) | 24px | `#16A34A` (green-600) |
| Inline with text | 16px | matches text color |
| Card action | 20px | `#6B7280` (gray-500) |
| Hero / large callout | 32px | `#16A34A` (green-600) |

### Icon Map (app-wide)

| Screen / Action | Icon |
|---|---|
| Home tab | `Home` |
| Booking tab | `CalendarPlus` |
| Credits tab | `Wallet` |
| History tab | `ClockIcon` |
| PIN / lock | `Lock`, `Unlock` |
| Timer / active session | `Timer` |
| Cancel / close | `X` |
| Confirm / check | `Check` |
| Chevron right | `ChevronRight` |
| Back | `ChevronLeft` |
| Top-up / add | `Plus` |
| Notification | `Bell` |
| Face ID | `ScanFace` |
| Logout | `LogOut` |
| Error | `AlertCircle` |
| Success | `CheckCircle` |
| Copy to clipboard | `Copy` |

---

## Navigation

### Tab Bar Style
- Background: `#FFFFFF`
- Border top: `1px solid #E5E7EB`
- Active tint: `#16A34A`
- Inactive tint: `#9CA3AF`
- Label style: 11px, semibold
- Tab bar height: default Expo Router (respects safe area)

### Header Style
- Background: `#F5F5F5` (matches screen bg)
- Title: `text-gray-900 font-semibold`
- No shadow/border (borderless feel)
- Back button: Lucide `ChevronLeft`, green-600

---

## Loading & Empty States

### Loading Skeleton
```tsx
<View className="bg-gray-100 rounded-xl animate-pulse h-24 w-full" />
```

### Empty State
```tsx
<View className="flex-1 items-center justify-center gap-3 py-16">
  <View className="bg-gray-100 rounded-full p-5">
    <CalendarX size={32} color="#9CA3AF" />
  </View>
  <Text className="text-gray-900 font-semibold text-base">No upcoming sessions</Text>
  <Text className="text-gray-500 text-sm text-center">
    Book your first session to get started.
  </Text>
</View>
```

---

## Specific Component Patterns

### PIN Display
- 6 digits, displayed as individual blocks or monospace string
- Large: `text-4xl font-bold tracking-[0.3em] text-gray-900`
- Hidden: `text-4xl font-bold tracking-[0.3em] text-gray-300` (show `••••••`)
- Background: subtle green tint `bg-green-50 rounded-2xl px-6 py-4`

### Countdown Timer
- Time remaining: `text-5xl font-bold text-gray-900` (MM:SS)
- Label: `text-sm text-gray-500`
- Progress bar: green fill, gray track, `rounded-full h-2`

### Credit Balance
- Large number: `text-4xl font-bold text-gray-900`
- Unit label: `text-base text-gray-500 ml-1` ("credits")
- Green accent dot or icon beside it

### Weekly Calendar
- Day column width: ~52px
- Selected day: `bg-green-600 rounded-full` with white text
- Available day: `bg-white` with green dot indicator below date
- Unavailable day: `text-gray-300`
- Today: bold date number

### Slot Button
- Available: `border border-gray-200 bg-white rounded-xl` → selected: `border-green-600 bg-green-50`
- Booked/unavailable: `bg-gray-100 opacity-50` (non-interactive)
- Time text: `text-sm font-semibold`
- Price: `text-xs text-gray-500`
