import type {
  PayBillCompletionSnapshot,
  PayBillFlowEntry,
} from "@/features/payBill/payBill.types"
import { effectivePayDiscountPercents } from "@/features/payBill/utils/payBillDiscounts"
import { usePayBillStore } from "@/features/payBill/store/payBillStore"

/** Read pay store before {@link usePayBillStore.reset} on successful payment exit. */
export function capturePayBillCompletionSnapshot(
  entry: PayBillFlowEntry,
): PayBillCompletionSnapshot | null {
  const s = usePayBillStore.getState()
  if (
    s.paidAmount == null ||
    s.cashbackEarnedEur == null ||
    s.paymentCode == null ||
    s.billAmount == null
  ) {
    return null
  }
  const { discountAddPercent } = effectivePayDiscountPercents(entry.offer)
  return {
    restaurantSlug: entry.restaurantSlug,
    restaurantName: entry.restaurantName,
    offerId: entry.offer?.offerId ?? null,
    discountPercent: entry.offer?.discountPercent ?? 0,
    discountAddPercent,
    paidAmount: s.paidAmount,
    cashbackEarnedEur: s.cashbackEarnedEur,
    receiptTotalEur: s.billAmount,
    tipEur: s.tip,
    paymentCode: s.paymentCode,
  }
}
