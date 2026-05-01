# Project Plan: DrFit App — Frontend MVP

> **Last updated:** 2026-05-01
> **Mode:** Hackathon MVP — speed over perfection. All data is mocked until backend is ready.
> **Target:** Full P1 feature set, iOS only.

---

## File Structure

```
drfit-app/
├── app/
│   ├── _layout.tsx              # Root layout — StripeProvider, PaperProvider, AuthProvider, DataProvider
│   ├── index.tsx                # Redirect: checks JWT in SecureStore → /onboarding or /(tabs)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack (no tab bar, no header)
│   │   ├── onboarding.tsx       # Welcome / first launch screen
│   │   └── login.tsx            # Email + password form + Face ID enrollment prompt
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar: Home, Booking, Credits, History
│       ├── index.tsx            # Home dashboard — hero card + upcoming reservations list
│       ├── booking/
│       │   ├── index.tsx        # Step 1: week calendar + slot list
│       │   └── confirm.tsx      # Step 2: summary + "Book for X credits" CTA
│       ├── credits/
│       │   ├── index.tsx        # Credit balance + transaction history
│       │   └── topup.tsx        # Package selection + Apple Pay
│       └── history.tsx          # Past reservations (completed + cancelled)
│
├── components/
│   ├── HeroCard.tsx             # Large reservation card with PIN state machine + timer
│   ├── BookingCard.tsx          # Small upcoming reservation card
│   ├── ActiveTimer.tsx          # MM:SS countdown + progress bar (useEffect interval)
│   ├── WeekCalendar.tsx         # Horizontal scrollable 7-day calendar strip
│   ├── SlotList.tsx             # Grid/list of available time slots for selected date
│   ├── CreditPackage.tsx        # Credit package selection card (with "Most Popular" badge)
│   └── TransactionItem.tsx      # Single row in credit history list
│
├── context/
│   ├── AuthContext.tsx          # user, token, login(), logout(), isFaceIDEnabled, toggleFaceID()
│   └── DataContext.tsx          # reservations, credits, transactions, addReservation(), cancelReservation(), topUp()
│
├── constants/
│   ├── colors.ts                # All color values (mirrors DESIGN_SYSTEM.md, single source of truth)
│   └── mock.ts                  # All mock data (re-exports from API_CONTRACT.md shapes)
│
├── suppress-logs.ts             # React 19 forwardRef shim — MUST be first import in _layout.tsx
│
├── global.css                   # @tailwind base/components/utilities
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
├── app.json
├── eas.json
├── .env                         # EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
│
└── (context docs)
    ├── CLAUDE.md
    ├── DESIGN_SYSTEM.md
    ├── API_CONTRACT.md
    ├── PROJECT_PLAN.md          ← this file
    └── IMPLEMENTATION_CONTEXT.md
```

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---|---|---|
| `expo` | `^55.0.0` | Core SDK |
| `expo-router` | `~5.x` | File-based navigation |
| `expo-secure-store` | — | JWT persistence |
| `expo-local-authentication` | — | Face ID / Touch ID |
| `expo-notifications` | — | Push notification token registration |
| `expo-constants` | — | `expoConfig`, env access |
| `@stripe/stripe-react-native` | `^0.65.0` | Apple Pay, Stripe payments |
| `nativewind` | `^4.x` | Tailwind CSS for RN |
| `tailwindcss` | `^3.x` | Tailwind (NativeWind peer dep) |
| `react-native-paper` | `^5.x` | TextInput, Modal, Provider |
| `react-native-safe-area-context` | — | SafeAreaView, useSafeAreaInsets |
| `react-native-gesture-handler` | — | Required by Expo Router |
| `react-native-reanimated` | — | Animations (required by Paper + Stripe) |
| `lucide-react-native` | — | Icon set |
| `react` | `19.2.0` | React runtime |
| `react-native` | `0.83.6` | RN runtime |

### Dev

| Package | Purpose |
|---|---|
| `typescript` | Type checking |
| `@types/react` | React type definitions |
| `babel-preset-expo` | Babel config |
| `expo-mcp` | Expo MCP server client (devDependency) |

---

## Implementation Phases

### Phase 1 — Foundation
- [ ] Install all dependencies via `expo-mcp_add_library`
- [ ] Configure NativeWind v4 (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`)
- [ ] Create `suppress-logs.ts`
- [ ] Create `constants/colors.ts`
- [ ] Create `constants/mock.ts` with all mock data
- [ ] Create `.env` with Stripe publishable key placeholder

### Phase 2 — State Management
- [ ] Create `context/AuthContext.tsx`
  - `user: User | null`
  - `token: string | null`
  - `isLoading: boolean`
  - `isFaceIDEnabled: boolean`
  - `login(email, password): Promise<void>`
  - `logout(): Promise<void>`
  - `enableFaceID(): Promise<void>`
  - JWT persisted via `expo-secure-store`
- [ ] Create `context/DataContext.tsx`
  - `reservations: Reservation[]`
  - `creditBalance: number`
  - `transactions: CreditTransaction[]`
  - `addReservation(slot: Slot): Promise<void>`
  - `cancelReservation(id: string): Promise<void>`
  - `topUpCredits(pkg: CreditPackage): Promise<void>`

### Phase 3 — Root Layout & Auth Flow
- [ ] `app/_layout.tsx` — wrap with all providers, import `suppress-logs` first
- [ ] `app/index.tsx` — redirect logic (SecureStore JWT check)
- [ ] `app/(auth)/_layout.tsx`
- [ ] `app/(auth)/onboarding.tsx` — DrFit logo, tagline, "Get Started" CTA
- [ ] `app/(auth)/login.tsx`
  - Email + password inputs (React Native Paper)
  - Login button → `AuthContext.login()`
  - Face ID prompt after first successful login
  - Face ID auto-login on subsequent opens

### Phase 4 — Home Dashboard
- [ ] `app/(tabs)/_layout.tsx` — tab bar with Lucide icons
- [ ] `components/HeroCard.tsx` — 4 states:
  - `hidden_pin`: slot > 30 min away → masked PIN `••••••`
  - `visible_pin`: slot within 30 min → visible 6-digit PIN + copy button + "Going to train" CTA
  - `active_timer`: session in progress → `ActiveTimer` component
  - `no_reservation`: no upcoming booking → "Book a session" CTA
- [ ] `components/ActiveTimer.tsx`
  - MM:SS countdown via `useEffect` interval
  - Progress bar (elapsed / total duration)
  - Cleans up interval on unmount
- [ ] `components/BookingCard.tsx` — compact card for secondary upcoming reservations
- [ ] `app/(tabs)/index.tsx` — compose dashboard

### Phase 5 — Booking Flow
- [ ] `components/WeekCalendar.tsx`
  - Horizontal `ScrollView`, 14-day range starting today
  - Day cell: day name + number + green availability dot
  - Selected state: `bg-green-600 rounded-full`
  - Auto-scroll to today on mount
- [ ] `components/SlotList.tsx`
  - Renders slots for selected date from `MOCK_SLOTS_BY_DATE`
  - Available: selectable with green border on selection
  - Booked: greyed out, non-interactive
- [ ] `app/(tabs)/booking/index.tsx` — WeekCalendar + SlotList
- [ ] `app/(tabs)/booking/confirm.tsx`
  - Summary: date, time, credit cost
  - "Book for X credits" → check balance → `DataContext.addReservation()`
  - If insufficient credits → modal with "Top Up Credits" CTA

### Phase 6 — Credits
- [ ] `components/TransactionItem.tsx` — icon by type, amount (+/-), description, date
- [ ] `components/CreditPackage.tsx` — package card, "Most Popular" badge for Premium
- [ ] `app/(tabs)/credits/index.tsx`
  - Large balance display
  - "Top Up" button → navigate to `/credits/topup`
  - `FlatList` of transactions
- [ ] `app/(tabs)/credits/topup.tsx`
  - List of `CreditPackage` cards
  - Selected package highlighted
  - "Pay with Apple Pay" button (`PlatformPayButton`)
  - `usePlatformPay` hook from `@stripe/stripe-react-native`
  - On success: `DataContext.topUpCredits()` → navigate back with success state

### Phase 7 — History
- [ ] `app/(tabs)/history.tsx`
  - `FlatList` of `completed` + `cancelled` reservations from `DataContext`
  - Sorted newest first
  - Status pill (Completed = green, Cancelled = red)
  - Date, time, credits spent / refunded

---

## Key Decisions

| Decision | Choice | Reason |
|---|---|---|
| State management | React Context | CLAUDE.md rule — no Redux/Zustand |
| Calendar | Custom component | Full control over UX, no heavy lib dependency |
| Styling | NativeWind only | CLAUDE.md rule — no StyleSheet |
| Data persistence | Mock in Context | Backend not ready, "fake it till you make it" |
| JWT storage | `expo-secure-store` | Encrypted native storage on iOS |
| Face ID | `expo-local-authentication` | See IMPLEMENTATION_CONTEXT.md |
| Apple Pay | `@stripe/stripe-react-native` `usePlatformPay` | See IMPLEMENTATION_CONTEXT.md |
| React 19 compat | `suppress-logs.ts` shim | Paper + Stripe use old forwardRef API |
| Currency | CZK | Czech market |
| Language | English (code), Czech (UI strings) | Agreed with team |

---

## Backend Integration Checklist (when backend is ready)

- [ ] Replace `MOCK_USER` login with real `POST /auth/login` call
- [ ] Store JWT from response in `SecureStore` (already wired up)
- [ ] Replace `MOCK_RESERVATIONS` with `GET /reservations`
- [ ] Replace `MOCK_SLOTS_BY_DATE` with `GET /slots?date=YYYY-MM-DD`
- [ ] Replace `MOCK_CREDIT_BALANCE` + `MOCK_TRANSACTIONS` with live endpoints
- [ ] Wire `POST /reservations` for booking
- [ ] Wire `DELETE /reservations/:id` for cancellation
- [ ] Wire `GET /reservations/:id/pin` for PIN reveal (currently mock returns pin from reservation object)
- [ ] Wire `POST /credits/topup` → get `clientSecret` → `confirmPlatformPayPayment`
- [ ] Wire `POST /notifications/token` after login
- [ ] Register Stripe webhook handler on backend for `/credits/topup/confirm`

---

## Environment Variables

```bash
# .env (never commit to git)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Known Constraints

- **Face ID & Apple Pay** require a dev build — do NOT use Expo Go for testing these features
- **Expo Go** works for all UI-only screens (home, booking, credits, history)
- **New Architecture** is enabled (`newArchEnabled: true`) — all libraries must support it
- **React 19** — `suppress-logs.ts` must be the first import in `app/_layout.tsx`
- **Apple Pay entitlements** — after adding `@stripe/stripe-react-native` plugin, run `npx expo prebuild --clean` to ensure `.entitlements` file is populated
