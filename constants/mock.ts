// All mock data for the DrFit app.
// Used by DataContext until the real backend API is available.
// See API_CONTRACT.md for full TypeScript interfaces and data shapes.

import type {
  User,
  Reservation,
  Slot,
  CreditTransaction,
  CreditPackage,
} from "./types";

// ─── Mock User ────────────────────────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "user-001",
  email: "john.doe@example.com",
  name: "John Doe",
  phone: "+420 777 123 456",
  createdAt: "2025-01-15T10:00:00Z",
};

// ─── Mock Credentials (for demo login) ────────────────────────────────────────

export const DEMO_EMAIL = "john.doe@example.com";
export const DEMO_PASSWORD = "password123";

// ─── Helper: build date strings relative to today ────────────────────────────

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// ─── Mock Reservations ────────────────────────────────────────────────────────

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    // Nearest upcoming — hero card (PIN hidden, > 30 min away)
    id: "res-001",
    userId: "user-001",
    slot: {
      id: "slot-101",
      date: daysFromNow(1),
      startTime: "10:00",
      endTime: "11:00",
      priceCredits: 100,
      isAvailable: false,
    },
    status: "active",
    pin: null,
    creditsSpent: 100,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    // Secondary upcoming card
    id: "res-002",
    userId: "user-001",
    slot: {
      id: "slot-102",
      date: daysFromNow(7),
      startTime: "14:00",
      endTime: "15:00",
      priceCredits: 100,
      isAvailable: false,
    },
    status: "active",
    pin: null,
    creditsSpent: 100,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    // Secondary upcoming card
    id: "res-003",
    userId: "user-001",
    slot: {
      id: "slot-103",
      date: daysFromNow(11),
      startTime: "08:00",
      endTime: "09:00",
      priceCredits: 100,
      isAvailable: false,
    },
    status: "active",
    pin: null,
    creditsSpent: 100,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    // Completed — history only
    id: "res-004",
    userId: "user-001",
    slot: {
      id: "slot-090",
      date: daysAgo(6),
      startTime: "09:00",
      endTime: "10:00",
      priceCredits: 100,
      isAvailable: false,
    },
    status: "completed",
    pin: "847291",
    creditsSpent: 100,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    // Cancelled — history only
    id: "res-005",
    userId: "user-001",
    slot: {
      id: "slot-089",
      date: daysAgo(13),
      startTime: "16:00",
      endTime: "17:00",
      priceCredits: 100,
      isAvailable: false,
    },
    status: "cancelled",
    pin: null,
    creditsSpent: 0,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Mock Slots (for booking screen) ──────────────────────────────────────────

export function getMockSlotsForDate(date: string): Slot[] {
  // Deterministically mark some slots as unavailable based on date
  const dayOfMonth = parseInt(date.split("-")[2], 10);
  const unavailableIndices = [
    dayOfMonth % 3,
    (dayOfMonth + 2) % 5,
    (dayOfMonth + 4) % 6,
  ];

  const times = [
    { start: "07:00", end: "08:00" },
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
    { start: "19:00", end: "20:00" },
    { start: "20:00", end: "21:00" },
  ];

  return times.map((t, i) => ({
    id: `slot-${date}-${i}`,
    date,
    startTime: t.start,
    endTime: t.end,
    priceCredits: 100,
    isAvailable: !unavailableIndices.includes(i),
  }));
}

// ─── Mock Credit Balance ──────────────────────────────────────────────────────

export const MOCK_INITIAL_BALANCE = 750;

// ─── Mock Transactions ────────────────────────────────────────────────────────

export const MOCK_TRANSACTIONS: CreditTransaction[] = [
  {
    id: "tx-001",
    userId: "user-001",
    amount: -100,
    type: "spend",
    description: `Booked session ${daysFromNow(1)} 10:00–11:00`,
    referenceId: "res-001",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-002",
    userId: "user-001",
    amount: -100,
    type: "spend",
    description: `Booked session ${daysFromNow(7)} 14:00–15:00`,
    referenceId: "res-002",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-003",
    userId: "user-001",
    amount: 100,
    type: "refund",
    description: `Refund: cancelled session ${daysAgo(13)} 16:00`,
    referenceId: "res-005",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-004",
    userId: "user-001",
    amount: -100,
    type: "spend",
    description: `Booked session ${daysAgo(6)} 09:00–10:00`,
    referenceId: "res-004",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-005",
    userId: "user-001",
    amount: 2200,
    type: "topup",
    description: "Premium pack — 2,000 + 200 bonus credits",
    referenceId: "stripe-pi-abc123",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "tx-006",
    userId: "user-001",
    amount: 1000,
    type: "topup",
    description: "Standard pack — 1,000 credits",
    referenceId: "stripe-pi-xyz789",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── Credit Packages (static — defined on frontend) ──────────────────────────

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: "pkg-starter",
    label: "Starter",
    priceKc: 500,
    credits: 500,
    bonusCredits: 0,
    totalCredits: 500,
    highlight: false,
  },
  {
    id: "pkg-standard",
    label: "Standard",
    priceKc: 1000,
    credits: 1000,
    bonusCredits: 0,
    totalCredits: 1000,
    highlight: false,
  },
  {
    id: "pkg-premium",
    label: "Premium",
    priceKc: 2000,
    credits: 2000,
    bonusCredits: 200,
    totalCredits: 2200,
    highlight: true,
  },
  {
    id: "pkg-pro",
    label: "Pro",
    priceKc: 5000,
    credits: 5000,
    bonusCredits: 750,
    totalCredits: 5750,
    highlight: false,
  },
];
