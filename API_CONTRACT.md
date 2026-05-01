# API Contract: DrFit App

> **Status:** Backend in development (colleague). All data is currently mocked.
> This file is the single source of truth for TypeScript interfaces, API endpoints,
> and mock data used across the frontend.

---

## TypeScript Interfaces

```typescript
// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;         // Display name
  phone?: string;
  createdAt: string;    // ISO 8601
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;        // JWT, expires in 30 days
  user: User;
}

// ─── Slots ───────────────────────────────────────────────────────────────────

export interface Slot {
  id: string;
  date: string;         // "YYYY-MM-DD"
  startTime: string;    // "HH:MM"
  endTime: string;      // "HH:MM"
  priceCredits: number; // cost in credits (e.g. 100)
  isAvailable: boolean; // false = already booked by someone else
}

// ─── Reservations ────────────────────────────────────────────────────────────

export type ReservationStatus = 'active' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  userId: string;
  slot: Slot;
  status: ReservationStatus;
  pin: string | null;           // null if > 30 min before start, else 6-digit string
  creditsSpent: number;
  createdAt: string;            // ISO 8601
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export type TransactionType = 'topup' | 'spend' | 'refund' | 'bonus';

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;               // positive = credit, negative = debit
  type: TransactionType;
  description: string;          // human-readable, e.g. "Booked Mon 9 Jun 10:00"
  referenceId?: string;         // reservation id or stripe payment id
  createdAt: string;            // ISO 8601
}

export interface CreditBalance {
  balance: number;
}

// ─── Credit Packages (static, defined on frontend) ───────────────────────────

export interface CreditPackage {
  id: string;
  label: string;          // "Starter", "Standard", "Premium", "Pro"
  priceKc: number;        // price in CZK
  credits: number;        // base credits
  bonusCredits: number;   // bonus on top (0 if none)
  totalCredits: number;   // credits + bonusCredits
  highlight: boolean;     // show "Most Popular" badge
}

// ─── Push Token ──────────────────────────────────────────────────────────────

export interface PushTokenRequest {
  token: string;          // Expo push token
  platform: 'ios' | 'android';
}

// ─── Feedback (P2) ───────────────────────────────────────────────────────────

export interface FeedbackRequest {
  reservationId?: string;
  rating: number;         // 1–5
  comment?: string;
}
```

---

## API Endpoints

Base URL: `https://api.drfit.cz/v1` (not yet live — all mocked on frontend)

### Auth

| Method | Endpoint | Request Body | Response | Notes |
|---|---|---|---|---|
| `POST` | `/auth/login` | `LoginRequest` | `LoginResponse` | Returns JWT + user |
| `POST` | `/auth/logout` | — | `{ success: true }` | Invalidates token server-side |
| `GET` | `/auth/me` | — | `User` | Bearer token required |

### Reservations

| Method | Endpoint | Params | Response | Notes |
|---|---|---|---|---|
| `GET` | `/slots` | `?date=YYYY-MM-DD` | `Slot[]` | Available slots for the day |
| `GET` | `/reservations` | — | `Reservation[]` | All user reservations |
| `POST` | `/reservations` | `{ slotId: string }` | `Reservation` | Deducts credits atomically |
| `DELETE` | `/reservations/:id` | — | `{ creditsRefunded: number }` | Full refund to credit balance |
| `GET` | `/reservations/:id/pin` | — | `{ pin: string }` | 403 if > 30 min before start |

### Credits

| Method | Endpoint | Request Body | Response | Notes |
|---|---|---|---|---|
| `GET` | `/credits/balance` | — | `CreditBalance` | Current balance |
| `GET` | `/credits/history` | — | `CreditTransaction[]` | All transactions, newest first |
| `POST` | `/credits/topup` | `{ packageId: string, paymentMethodId: string }` | `{ clientSecret: string }` | Creates Stripe PaymentIntent |
| `POST` | `/credits/topup/confirm` | Stripe webhook | — | Server-side only, never called from app |

### Notifications

| Method | Endpoint | Request Body | Response | Notes |
|---|---|---|---|---|
| `POST` | `/notifications/token` | `PushTokenRequest` | `{ success: true }` | Called after login |

### Feedback (P2)

| Method | Endpoint | Request Body | Response | Notes |
|---|---|---|---|---|
| `POST` | `/feedback` | `FeedbackRequest` | `{ success: true }` | — |

---

## Mock Data

> Used directly in `context/DataContext.tsx` and `constants/mock.ts`.
> All text is in English.

### Mock User

```typescript
export const MOCK_USER: User = {
  id: 'user-001',
  email: 'john.doe@example.com',
  name: 'John Doe',
  phone: '+420 777 123 456',
  createdAt: '2025-01-15T10:00:00Z',
};
```

### Mock Reservations

```typescript
// Helper: build a date string relative to today
// Reservation states cover all 4 hero card scenarios

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    // UPCOMING (> 30 min away) — PIN hidden
    id: 'res-001',
    userId: 'user-001',
    slot: {
      id: 'slot-101',
      date: '2026-05-05',        // adjust to "tomorrow" when integrating
      startTime: '10:00',
      endTime: '11:00',
      priceCredits: 100,
      isAvailable: false,
    },
    status: 'active',
    pin: null,
    creditsSpent: 100,
    createdAt: '2026-04-28T09:15:00Z',
  },
  {
    // UPCOMING — secondary card
    id: 'res-002',
    userId: 'user-001',
    slot: {
      id: 'slot-102',
      date: '2026-05-08',
      startTime: '14:00',
      endTime: '15:00',
      priceCredits: 100,
      isAvailable: false,
    },
    status: 'active',
    pin: null,
    creditsSpent: 100,
    createdAt: '2026-04-29T11:30:00Z',
  },
  {
    // UPCOMING — secondary card
    id: 'res-003',
    userId: 'user-001',
    slot: {
      id: 'slot-103',
      date: '2026-05-12',
      startTime: '08:00',
      endTime: '09:00',
      priceCredits: 100,
      isAvailable: false,
    },
    status: 'active',
    pin: null,
    creditsSpent: 100,
    createdAt: '2026-04-30T08:00:00Z',
  },
  {
    // COMPLETED — goes to history
    id: 'res-004',
    userId: 'user-001',
    slot: {
      id: 'slot-090',
      date: '2026-04-25',
      startTime: '09:00',
      endTime: '10:00',
      priceCredits: 100,
      isAvailable: false,
    },
    status: 'completed',
    pin: '847291',
    creditsSpent: 100,
    createdAt: '2026-04-20T14:00:00Z',
  },
  {
    // CANCELLED — goes to history
    id: 'res-005',
    userId: 'user-001',
    slot: {
      id: 'slot-089',
      date: '2026-04-18',
      startTime: '16:00',
      endTime: '17:00',
      priceCredits: 100,
      isAvailable: false,
    },
    status: 'cancelled',
    pin: null,
    creditsSpent: 0,              // refunded
    createdAt: '2026-04-10T10:00:00Z',
  },
];
```

### Mock Available Slots (for booking screen)

```typescript
// Returned for a given date by GET /slots?date=YYYY-MM-DD
export const MOCK_SLOTS_BY_DATE: Record<string, Slot[]> = {
  // Slots are the same structure every day; isAvailable varies
  default: [
    { id: 'slot-a1', date: '', startTime: '07:00', endTime: '08:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a2', date: '', startTime: '08:00', endTime: '09:00', priceCredits: 100, isAvailable: false },
    { id: 'slot-a3', date: '', startTime: '09:00', endTime: '10:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a4', date: '', startTime: '10:00', endTime: '11:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a5', date: '', startTime: '11:00', endTime: '12:00', priceCredits: 100, isAvailable: false },
    { id: 'slot-a6', date: '', startTime: '13:00', endTime: '14:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a7', date: '', startTime: '14:00', endTime: '15:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a8', date: '', startTime: '15:00', endTime: '16:00', priceCredits: 100, isAvailable: false },
    { id: 'slot-a9', date: '', startTime: '16:00', endTime: '17:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a10', date: '', startTime: '17:00', endTime: '18:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a11', date: '', startTime: '18:00', endTime: '19:00', priceCredits: 100, isAvailable: true },
    { id: 'slot-a12', date: '', startTime: '19:00', endTime: '20:00', priceCredits: 100, isAvailable: false },
    { id: 'slot-a13', date: '', startTime: '20:00', endTime: '21:00', priceCredits: 100, isAvailable: true },
  ],
};
```

### Mock Credit Balance

```typescript
export const MOCK_CREDIT_BALANCE: CreditBalance = {
  balance: 750,
};
```

### Mock Credit Transactions

```typescript
export const MOCK_TRANSACTIONS: CreditTransaction[] = [
  {
    id: 'tx-001',
    userId: 'user-001',
    amount: -100,
    type: 'spend',
    description: 'Booked Mon 5 May, 10:00–11:00',
    referenceId: 'res-001',
    createdAt: '2026-04-28T09:15:00Z',
  },
  {
    id: 'tx-002',
    userId: 'user-001',
    amount: -100,
    type: 'spend',
    description: 'Booked Thu 8 May, 14:00–15:00',
    referenceId: 'res-002',
    createdAt: '2026-04-29T11:30:00Z',
  },
  {
    id: 'tx-003',
    userId: 'user-001',
    amount: 100,
    type: 'refund',
    description: 'Refund: Fri 18 Apr, 16:00–17:00 cancelled',
    referenceId: 'res-005',
    createdAt: '2026-04-12T15:00:00Z',
  },
  {
    id: 'tx-004',
    userId: 'user-001',
    amount: -100,
    type: 'spend',
    description: 'Booked Fri 25 Apr, 09:00–10:00',
    referenceId: 'res-004',
    createdAt: '2026-04-20T14:00:00Z',
  },
  {
    id: 'tx-005',
    userId: 'user-001',
    amount: 2200,
    type: 'topup',
    description: 'Premium pack — 2 000 + 200 bonus credits',
    referenceId: 'stripe-pi-abc123',
    createdAt: '2026-04-10T09:00:00Z',
  },
  {
    id: 'tx-006',
    userId: 'user-001',
    amount: 1000,
    type: 'topup',
    description: 'Standard pack — 1 000 credits',
    referenceId: 'stripe-pi-xyz789',
    createdAt: '2026-03-01T12:00:00Z',
  },
];
```

### Mock Credit Packages (static — defined on frontend, not from API)

```typescript
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    label: 'Starter',
    priceKc: 500,
    credits: 500,
    bonusCredits: 0,
    totalCredits: 500,
    highlight: false,
  },
  {
    id: 'pkg-standard',
    label: 'Standard',
    priceKc: 1000,
    credits: 1000,
    bonusCredits: 0,
    totalCredits: 1000,
    highlight: false,
  },
  {
    id: 'pkg-premium',
    label: 'Premium',
    priceKc: 2000,
    credits: 2000,
    bonusCredits: 200,
    totalCredits: 2200,
    highlight: true,   // "Most Popular"
  },
  {
    id: 'pkg-pro',
    label: 'Pro',
    priceKc: 5000,
    credits: 5000,
    bonusCredits: 750,
    totalCredits: 5750,
    highlight: false,
  },
];
```

---

## PIN Logic (frontend rule)

The backend returns `pin: null` for reservations where `now < startTime - 30min`.
The frontend **never shows** the PIN unless `pin !== null`.

```typescript
// Helper used in HeroCard and reservation detail
export function isPinVisible(reservation: Reservation): boolean {
  return reservation.pin !== null;
}

export function isSessionActive(slot: Slot): boolean {
  const now = new Date();
  const [startH, startM] = slot.startTime.split(':').map(Number);
  const [endH, endM] = slot.endTime.split(':').map(Number);
  const start = new Date(slot.date);
  start.setHours(startH, startM, 0, 0);
  const end = new Date(slot.date);
  end.setHours(endH, endM, 0, 0);
  return now >= start && now < end;
}

export function isWithin30Min(slot: Slot): boolean {
  const now = new Date();
  const [h, m] = slot.startTime.split(':').map(Number);
  const start = new Date(slot.date);
  start.setHours(h, m, 0, 0);
  const diffMs = start.getTime() - now.getTime();
  return diffMs <= 30 * 60 * 1000 && diffMs > 0;
}
```

---

## Apple Pay / Stripe Integration Notes

- **Publishable key:** stored in `.env` as `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Merchant identifier:** `merchant.com.drfit.app` (register in Apple Developer Portal)
- **Flow:**
  1. User selects package → app calls `POST /credits/topup` → backend returns `clientSecret`
  2. App calls `confirmPlatformPayPayment(clientSecret, { applePay: { ... } })`
  3. Apple Pay sheet shown; user authorizes
  4. Stripe webhook calls `POST /credits/topup/confirm` server-side → credits added
  5. App polls `GET /credits/balance` or listens for success callback to update balance
- **Currency:** CZK, merchant country: CZ
- **While backend is not ready:** use `createPlatformPayPaymentMethod` to show the real sheet; skip backend call and optimistically add credits to mock state
