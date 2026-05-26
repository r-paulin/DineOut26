import {
  cashbackAmountEur,
  discountAmountCompound,
  payAmountDue,
} from "@/features/payBill/utils/discountCalc"
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
  discountAmount: number
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
      const discountAmount =
        req.discountAddPercent > 0 ?
          cashbackAmountEur(
            req.receiptTotal,
            req.tip,
            req.discountAddPercent,
          )
        : discountAmountCompound(
            req.receiptTotal,
            req.tip,
            req.discountPercent,
            0,
          )
      const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`
      const paymentCode = createPaymentCode()
      const paidAt = new Date().toISOString()
      resolve({ transactionId, paymentCode, paidAt, paidAmount, discountAmount })
    }, 900)
  })
}
