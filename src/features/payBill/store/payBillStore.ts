import { create } from "zustand"
import { CHECKOUT_PAYMENT_DEFAULT_OPTION_ID } from "@/features/payBill/constants/checkoutPaymentOptions"
import type {
  PayBillFlowEntry,
  PayBillSnackbarIntent,
  PayBillStep,
} from "@/features/payBill/payBill.types"

export interface PayBillStoreState {
  step: PayBillStep
  entry: PayBillFlowEntry | null
  billAmount: number | null
  tip: number | null
  intentSnackbar: PayBillSnackbarIntent
  transactionId: string | null
  paymentCode: string | null
  paidAt: string | null
  paidAmount: number | null
  cashbackEarnedEur: number | null
  selectedCardId: string | null
  paymentMethodUi: "bolt_balance" | "card" | null
  /** Selected funding for the non–Bolt Balance portion of checkout (Figma Payment). */
  checkoutPaymentOptionId: string
  open: (entry: PayBillFlowEntry) => void
  reset: () => void
  setStep: (step: PayBillStep) => void
  setBillAmount: (amount: number) => void
  setTip: (tip: number | null) => void
  setIntentSnackbar: (intent: PayBillSnackbarIntent) => void
  setPostPayment: (payload: {
    transactionId: string
    paymentCode: string
    paidAt: string
    paidAmount: number
    cashbackEarnedEur: number
    paymentMethodUi: "bolt_balance" | "card"
  }) => void
  /** Atomic transition to payment confirmation after mock/API pay succeeds. */
  completePayment: (payload: {
    transactionId: string
    paymentCode: string
    paidAt: string
    paidAmount: number
    cashbackEarnedEur: number
    paymentMethodUi: "bolt_balance" | "card"
  }) => void
  setSelectedCardId: (id: string | null) => void
  setCheckoutPaymentOptionId: (id: string) => void
}

const initial = (): Omit<
  PayBillStoreState,
  | "open"
  | "reset"
  | "setStep"
  | "setBillAmount"
  | "setTip"
  | "setIntentSnackbar"
  | "setPostPayment"
  | "completePayment"
  | "setSelectedCardId"
  | "setCheckoutPaymentOptionId"
> => ({
  step: "billAmount",
  entry: null,
  billAmount: null,
  tip: null,
  intentSnackbar: null,
  transactionId: null,
  paymentCode: null,
  paidAt: null,
  paidAmount: null,
  cashbackEarnedEur: null,
  selectedCardId: "card-default",
  paymentMethodUi: null,
  checkoutPaymentOptionId: CHECKOUT_PAYMENT_DEFAULT_OPTION_ID,
})

export const usePayBillStore = create<PayBillStoreState>((set) => ({
  ...initial(),
  open: (entry) =>
    set({
      ...initial(),
      entry,
      step: "billAmount",
    }),
  reset: () => set(initial()),
  setStep: (step) => set({ step }),
  setBillAmount: (billAmount) => set({ billAmount }),
  setTip: (tip) => set({ tip }),
  setIntentSnackbar: (intentSnackbar) => set({ intentSnackbar }),
  setPostPayment: (payload) =>
    set({
      transactionId: payload.transactionId,
      paymentCode: payload.paymentCode,
      paidAt: payload.paidAt,
      paidAmount: payload.paidAmount,
      cashbackEarnedEur: payload.cashbackEarnedEur,
      paymentMethodUi: payload.paymentMethodUi,
    }),
  completePayment: (payload) =>
    set({
      transactionId: payload.transactionId,
      paymentCode: payload.paymentCode,
      paidAt: payload.paidAt,
      paidAmount: payload.paidAmount,
      cashbackEarnedEur: payload.cashbackEarnedEur,
      paymentMethodUi: payload.paymentMethodUi,
      step: "confirmation",
    }),
  setSelectedCardId: (selectedCardId) => set({ selectedCardId }),
  setCheckoutPaymentOptionId: (checkoutPaymentOptionId) =>
    set({ checkoutPaymentOptionId }),
}))
