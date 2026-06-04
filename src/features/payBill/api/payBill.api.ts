import { cashbackAmountEur, payAmountDue } from "@/features/payBill/utils/discountCalc"
import { createPaymentCode } from "@/features/payBill/utils/paymentCodeDisplay"

export interface PayBillPaymentRequest {
  offerId: string
  restaurantSlug: string
  receiptTotal: number
  tip: number | null
  discountPercent: number
  discountAddPercent: number
}

export interface PayBillPaymentResult {
  transactionId: string
  paymentCode: string
  paidAt: string
  paidAmount: number
  /** Post-payment Bolt Balance cashback only (never in-checkout venue discount). */
  cashbackEarnedEur: number
}

/** Prototype payment — resolves after a short delay. */
export function payBillMock(
  req: PayBillPaymentRequest,
): Promise<PayBillPaymentResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const paidAmount = payAmountDue(
        req.receiptTotal,
        req.tip,
        req.discountPercent,
      )
      const cashbackEarnedEur =
        req.discountAddPercent > 0 ?
          cashbackAmountEur(
            req.receiptTotal,
            req.tip,
            req.discountAddPercent,
          )
        : 0
      const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`
      const paymentCode = createPaymentCode()
      const paidAt = new Date().toISOString()
      resolve({
        transactionId,
        paymentCode,
        paidAt,
        paidAmount,
        cashbackEarnedEur,
      })
    }, 900)
  })
}
