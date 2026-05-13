import { createLogger } from "@/shared/utils/logger"
import {
  discountAmountCompound,
  finalAmountCompound,
} from "@/features/payBill/utils/discountCalc"

const log = createLogger("payBill.api")

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
  paidAt: string
  paidAmount: number
  discountAmount: number
}

/** Prototype payment — resolves after a short delay. */
export function payBillMock(
  req: PayBillPaymentRequest,
): Promise<PayBillPaymentResult> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      const paidAmount = finalAmountCompound(
        req.receiptTotal,
        req.tip,
        req.discountPercent,
        req.discountAddPercent,
      )
      const discountAmount = discountAmountCompound(
        req.receiptTotal,
        req.tip,
        req.discountPercent,
        req.discountAddPercent,
      )
      const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`
      const paidAt = new Date().toISOString()
      resolve({ transactionId, paidAt, paidAmount, discountAmount })
    }, 900)
  })
}

/** Fire-and-forget rating (PRD). */
export function submitOfferRating(
  offerId: string,
  body: { rating: number; feedback: string | null },
): void {
  void fetch(`/api/offers/${encodeURIComponent(offerId)}/rating`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch((err: unknown) => {
    log.warn("rating submit failed", { offerId, err })
  })
}
