import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  apiGetCenters,
  apiGetSlots,
  apiGetReservations,
  apiCreateReservation,
  apiCancelReservation,
  apiGetCreditBalance,
  apiGetCreditHistory,
  apiUpdateMe,
  ApiSlot,
} from "@/lib/api";
import {
  normaliseStatus,
  normaliseTransactionType,
} from "@/constants/types";
import type {
  Center,
  Reservation,
  CreditTransaction,
  Slot,
  CreditPackage,
} from "@/constants/types";
import { CREDIT_PACKAGES } from "@/constants/mock";
import { useAuth } from "./AuthContext";
import { useWorkoutLiveActivity } from "@/hooks/useWorkoutLiveActivity";

// ─── Dev flag: inject a fake "currently active" reservation ──────────────────
// Set to true to simulate a workout in progress (start = now, end = +30 min)
// for testing Live Activity / Dynamic Island. Remove before shipping.
const INJECT_FAKE_ACTIVE_RESERVATION = true;

function buildFakeActiveReservation(centerName: string, centerId: string): Reservation {
  const now = new Date();
  // Round start to "now" minus 1 minute (so we are clearly inside the window)
  const start = new Date(now.getTime() - 60 * 1000);
  const end = new Date(now.getTime() + 30 * 60 * 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  return {
    id: "dev-fake-active",
    slot: {
      id: "dev-fake-slot",
      centerId,
      date: dateStr,
      startTime,
      endTime,
      priceCredits: 1,
      isAvailable: false,
    },
    centerId,
    centerName,
    centerAddress: "Dev Test Address",
    status: "active",
    pin: "1234",
    creditsSpent: 1,
    createdAt: now.toISOString(),
  };
}

// ─── Cache: slots by "date|centerId" ─────────────────────────────────────────
type SlotCache = Record<string, Slot[]>;

function apiSlotToSlot(s: ApiSlot): Slot {
  return {
    id: s.id,
    centerId: s.centerId,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    priceCredits: s.priceCredits,
    isAvailable: s.isAvailable,
  };
}

interface DataContextValue {
  // Centers
  centers: Center[];
  selectedCenter: Center;
  setSelectedCenter: (center: Center) => void;
  // Reservations
  reservations: Reservation[];
  creditBalance: number;
  transactions: CreditTransaction[];
  isLoadingData: boolean;
  // Booking
  getSlotsForDate: (date: string) => Slot[];
  fetchSlotsForDate: (date: string) => Promise<void>;
  addReservation: (slot: Slot) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  // Credits
  topUpCredits: (pkg: CreditPackage) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();

  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenterState] = useState<Center | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [slotCache, setSlotCache] = useState<SlotCache>({});
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Track in-flight slot fetches to avoid duplicate requests
  const pendingSlotFetches = useRef<Set<string>>(new Set());

  // ── Initial load when user is authenticated ────────────────────────────────
  useEffect(() => {
    if (!token) {
      // User logged out — reset all data
      setCenters([]);
      setSelectedCenterState(null);
      setReservations([]);
      setCreditBalance(0);
      setTransactions([]);
      setSlotCache({});
      return;
    }
    loadInitialData();
  }, [token]);

  async function loadInitialData() {
    setIsLoadingData(true);
    try {
      const [apiCenters, apiReservations, balance, txHistory] =
        await Promise.all([
          apiGetCenters(),
          apiGetReservations(),
          apiGetCreditBalance(),
          apiGetCreditHistory(50),
        ]);

      const mappedCenters: Center[] = apiCenters.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        description: c.description,
        imageUrl: c.imageUrl,
      }));

      setCenters(mappedCenters);
      // Default to first center (will be overridden by user defaultCenter later)
      setSelectedCenterState((prev) => prev ?? mappedCenters[0] ?? null);

      const mappedReservations: Reservation[] = apiReservations.map((r) => ({
        id: r.id,
        slot: apiSlotToSlot(r.slot),
        centerId: r.slot.center?.id ?? r.slot.centerId,
        centerName: r.slot.center?.name ?? "—",
        centerAddress: r.slot.center?.address ?? "—",
        status: normaliseStatus(r.status),
        pin: r.pin ?? null,
        creditsSpent: r.creditsSpent,
        createdAt: r.createdAt,
      }));
      setReservations(
        (() => {
          const all = INJECT_FAKE_ACTIVE_RESERVATION
            ? [
                buildFakeActiveReservation(
                  mappedCenters[0]?.name ?? "DrFit Center",
                  mappedCenters[0]?.id ?? "dev-center"
                ),
                ...mappedReservations,
              ]
            : mappedReservations;
          return all.sort(
            (a, b) =>
              new Date(a.slot.date + "T" + a.slot.startTime).getTime() -
              new Date(b.slot.date + "T" + b.slot.startTime).getTime()
          );
        })()
      );

      setCreditBalance(balance);

      const mappedTx: CreditTransaction[] = txHistory.map((t) => ({
        id: t.id,
        amount: t.amount,
        type: normaliseTransactionType(t.type),
        description: t.description,
        referenceId: t.referenceId,
        createdAt: t.createdAt,
      }));
      setTransactions(mappedTx);
    } catch (e) {
      // Silently fail — user sees empty states
      console.warn("[DataContext] loadInitialData error:", e);
    } finally {
      setIsLoadingData(false);
    }
  }

  // ── Set selected center + sync defaultCenterId to backend ─────────────────
  const setSelectedCenter = useCallback(
    async (center: Center) => {
      setSelectedCenterState(center);
      // Invalidate slot cache for other centers
      setSlotCache({});
      // Persist to backend (best-effort)
      try {
        await apiUpdateMe(center.id);
      } catch {}
    },
    []
  );

  // ── Slot access: sync cache lookup + async fetch ──────────────────────────
  const getSlotsForDate = useCallback(
    (date: string): Slot[] => {
      if (!selectedCenter) return [];
      const key = `${date}|${selectedCenter.id}`;
      return slotCache[key] ?? [];
    },
    [selectedCenter, slotCache]
  );

  const fetchSlotsForDate = useCallback(
    async (date: string) => {
      if (!selectedCenter) return;
      const key = `${date}|${selectedCenter.id}`;
      if (slotCache[key] || pendingSlotFetches.current.has(key)) return;

      pendingSlotFetches.current.add(key);
      try {
        const apiSlots = await apiGetSlots(date, selectedCenter.id);
        const mapped = apiSlots.map(apiSlotToSlot);
        setSlotCache((prev) => ({ ...prev, [key]: mapped }));
      } catch {
        // Slot fetch failed — leave cache empty (shows "No slots")
      } finally {
        pendingSlotFetches.current.delete(key);
      }
    },
    [selectedCenter, slotCache]
  );

  // ── Book a slot ───────────────────────────────────────────────────────────
  const addReservation = useCallback(
    async (slot: Slot) => {
      const apiRes = await apiCreateReservation(slot.id);

      const newReservation: Reservation = {
        id: apiRes.id,
        slot: apiSlotToSlot(apiRes.slot),
        centerId: apiRes.slot.center?.id ?? slot.centerId,
        centerName: apiRes.slot.center?.name ?? selectedCenter?.name ?? "—",
        centerAddress: apiRes.slot.center?.address ?? selectedCenter?.address ?? "—",
        status: normaliseStatus(apiRes.status),
        pin: apiRes.pin ?? null,
        creditsSpent: apiRes.creditsSpent,
        createdAt: apiRes.createdAt,
      };

      setReservations((prev) =>
        [newReservation, ...prev].sort(
          (a, b) =>
            new Date(a.slot.date + "T" + a.slot.startTime).getTime() -
            new Date(b.slot.date + "T" + b.slot.startTime).getTime()
        )
      );

      // Refresh balance from server (authoritative)
      const newBalance = await apiGetCreditBalance();
      setCreditBalance(newBalance);

      // Mark slot as unavailable in cache
      const key = `${slot.date}|${slot.centerId}`;
      setSlotCache((prev) => {
        const cached = prev[key];
        if (!cached) return prev;
        return {
          ...prev,
          [key]: cached.map((s) =>
            s.id === slot.id ? { ...s, isAvailable: false } : s
          ),
        };
      });
    },
    [selectedCenter]
  );

  // ── Cancel a reservation ──────────────────────────────────────────────────
  const cancelReservation = useCallback(async (id: string) => {
    await apiCancelReservation(id);

    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "cancelled" as const, creditsSpent: 0 }
          : r
      )
    );

    // Refresh balance (credit refunded by backend)
    const newBalance = await apiGetCreditBalance();
    setCreditBalance(newBalance);
  }, []);

  // ── Top up credits (optimistic for now — Stripe flow wires in later) ──────
  const topUpCredits = useCallback(async (pkg: CreditPackage) => {
    // The real Stripe flow will call apiCreateTopupIntent → confirm PaymentIntent
    // → backend webhook updates balance. For now we just refresh after simulated delay.
    await new Promise((r) => setTimeout(r, 800));
    const newBalance = await apiGetCreditBalance();
    setCreditBalance(newBalance);
  }, []);

  // ── Manually refresh balance ───────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    try {
      const b = await apiGetCreditBalance();
      setCreditBalance(b);
    } catch {}
  }, []);

  // ── iOS Live Activity + Lock Screen widget sync ────────────────────────────
  // No-ops on Android and in Expo Go.
  useWorkoutLiveActivity(reservations);

  // Guard: render nothing until we have at least one center loaded
  const safeSelectedCenter: Center = selectedCenter ?? {
    id: "",
    name: "Loading...",
    address: "",
  };

  return (
    <DataContext.Provider
      value={{
        centers,
        selectedCenter: safeSelectedCenter,
        setSelectedCenter,
        reservations,
        creditBalance,
        transactions,
        isLoadingData,
        getSlotsForDate,
        fetchSlotsForDate,
        addReservation,
        cancelReservation,
        topUpCredits,
        refreshBalance,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
