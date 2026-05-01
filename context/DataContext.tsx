import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import {
  MOCK_RESERVATIONS,
  MOCK_TRANSACTIONS,
  MOCK_INITIAL_BALANCE,
  getMockSlotsForDate,
} from "@/constants/mock";
import type {
  Reservation,
  CreditTransaction,
  Slot,
  CreditPackage,
} from "@/constants/types";

interface DataContextValue {
  reservations: Reservation[];
  creditBalance: number;
  transactions: CreditTransaction[];
  // Booking
  getSlotsForDate: (date: string) => Slot[];
  addReservation: (slot: Slot) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  // Credits
  topUpCredits: (pkg: CreditPackage) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [reservations, setReservations] =
    useState<Reservation[]>(MOCK_RESERVATIONS);
  const [creditBalance, setCreditBalance] = useState(MOCK_INITIAL_BALANCE);
  const [transactions, setTransactions] =
    useState<CreditTransaction[]>(MOCK_TRANSACTIONS);

  const getSlotsForDate = useCallback((date: string): Slot[] => {
    return getMockSlotsForDate(date);
  }, []);

  const addReservation = useCallback(
    async (slot: Slot) => {
      if (creditBalance < slot.priceCredits) {
        throw new Error("Insufficient credits.");
      }

      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        userId: "user-001",
        slot: { ...slot, isAvailable: false },
        status: "active",
        pin: null,
        creditsSpent: slot.priceCredits,
        createdAt: new Date().toISOString(),
      };

      const newTransaction: CreditTransaction = {
        id: `tx-${Date.now()}`,
        userId: "user-001",
        amount: -slot.priceCredits,
        type: "spend",
        description: `Booked session ${slot.date} ${slot.startTime}–${slot.endTime}`,
        referenceId: newReservation.id,
        createdAt: new Date().toISOString(),
      };

      setReservations((prev) =>
        [newReservation, ...prev].sort(
          (a, b) =>
            new Date(a.slot.date + "T" + a.slot.startTime).getTime() -
            new Date(b.slot.date + "T" + b.slot.startTime).getTime()
        )
      );
      setCreditBalance((prev) => prev - slot.priceCredits);
      setTransactions((prev) => [newTransaction, ...prev]);
    },
    [creditBalance]
  );

  const cancelReservation = useCallback(async (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "cancelled" as const, creditsSpent: 0 }
          : r
      )
    );

    const reservation = reservations.find((r) => r.id === id);
    if (reservation && reservation.creditsSpent > 0) {
      const refundTx: CreditTransaction = {
        id: `tx-${Date.now()}`,
        userId: "user-001",
        amount: reservation.creditsSpent,
        type: "refund",
        description: `Refund: cancelled ${reservation.slot.date} ${reservation.slot.startTime}`,
        referenceId: id,
        createdAt: new Date().toISOString(),
      };
      setCreditBalance((prev) => prev + reservation.creditsSpent);
      setTransactions((prev) => [refundTx, ...prev]);
    }
  }, [reservations]);

  const topUpCredits = useCallback(async (pkg: CreditPackage) => {
    // In production: POST /credits/topup → get clientSecret → confirm Apple Pay
    // For now: optimistically add credits after successful Apple Pay sheet
    const topUpTx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      userId: "user-001",
      amount: pkg.totalCredits,
      type: "topup",
      description:
        pkg.bonusCredits > 0
          ? `${pkg.label} pack — ${pkg.credits.toLocaleString()} + ${pkg.bonusCredits} bonus credits`
          : `${pkg.label} pack — ${pkg.credits.toLocaleString()} credits`,
      referenceId: `stripe-pi-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCreditBalance((prev) => prev + pkg.totalCredits);
    setTransactions((prev) => [topUpTx, ...prev]);
  }, []);

  return (
    <DataContext.Provider
      value={{
        reservations,
        creditBalance,
        transactions,
        getSlotsForDate,
        addReservation,
        cancelReservation,
        topUpCredits,
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
