import { create } from "zustand";
import { persist } from "zustand/middleware";

// Matches the real backend's ServiceType enum (prisma/schema.prisma) exactly.
export const ORDER_SERVICE_TYPES = [
  "SIWES",
  "ACADEMIC",
  "TRADE_STRATEGY",
  "EDUCATION_CONSULTANT",
  "DIGITAL_MARKETING",
  "SIGNALS",
] as const;
export type OrderServiceType = (typeof ORDER_SERVICE_TYPES)[number];

interface OrderDraftState {
  currentStep: number;
  serviceType: OrderServiceType;
  totalAmount: string;
  currency: string;
  notes: string;
  setStep: (step: number) => void;
  setServiceType: (serviceType: OrderServiceType) => void;
  setTotalAmount: (totalAmount: string) => void;
  setNotes: (notes: string) => void;
  reset: () => void;
}

const initialDraft = {
  currentStep: 0,
  serviceType: "SIWES" as OrderServiceType,
  totalAmount: "",
  currency: "NGN",
  notes: "",
};

/**
 * Persists the "Place New Order" multi-step form across navigation and page
 * reloads. Field set matches orders.schema.ts's orderCreateSchema on the
 * real backend (serviceType/totalAmount/currency/notes) — the previous
 * version had a `requirements` field that doesn't exist on the real order
 * creation endpoint at all.
 */
export const useOrderDraftStore = create<OrderDraftState>()(
  persist(
    (set) => ({
      ...initialDraft,
      setStep: (currentStep) => set({ currentStep }),
      setServiceType: (serviceType) => set({ serviceType }),
      setTotalAmount: (totalAmount) => set({ totalAmount }),
      setNotes: (notes) => set({ notes }),
      reset: () => set(initialDraft),
    }),
    { name: "pepnetcom-order-draft" }
  )
);
