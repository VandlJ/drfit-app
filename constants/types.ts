// Shared TypeScript types for the DrFit app.
// These mirror the API contract defined in API_CONTRACT.md.

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
}

export interface Slot {
  id: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime: string;    // "HH:MM"
  priceCredits: number;
  isAvailable: boolean;
}

export type ReservationStatus = "active" | "completed" | "cancelled";

export interface Reservation {
  id: string;
  userId: string;
  slot: Slot;
  status: ReservationStatus;
  pin: string | null;  // null = not yet revealed (> 30 min before start)
  creditsSpent: number;
  createdAt: string;
}

export type TransactionType = "topup" | "spend" | "refund" | "bonus";

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;       // positive = credit in, negative = debit
  type: TransactionType;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export interface CreditPackage {
  id: string;
  label: string;
  priceKc: number;
  credits: number;
  bonusCredits: number;
  totalCredits: number;
  highlight: boolean;
}

// ─── PIN / Timer helpers ──────────────────────────────────────────────────────

export type HeroCardState =
  | "no_reservation"
  | "hidden_pin"
  | "visible_pin"
  | "active_timer";

export function getSlotStartDate(slot: Slot): Date {
  const [h, m] = slot.startTime.split(":").map(Number);
  const d = new Date(slot.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getSlotEndDate(slot: Slot): Date {
  const [h, m] = slot.endTime.split(":").map(Number);
  const d = new Date(slot.date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function getHeroCardState(reservation: Reservation | null): HeroCardState {
  if (!reservation) return "no_reservation";

  const now = new Date();
  const start = getSlotStartDate(reservation.slot);
  const end = getSlotEndDate(reservation.slot);
  const diffMs = start.getTime() - now.getTime();

  if (now >= start && now < end) return "active_timer";
  if (diffMs > 0 && diffMs <= 30 * 60 * 1000) return "visible_pin";
  if (diffMs > 30 * 60 * 1000) return "hidden_pin";
  return "no_reservation";
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(timeStr: string): string {
  return timeStr; // already "HH:MM"
}
