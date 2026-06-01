import type { ClaimedOffer, PaidOfferRecord } from "@/features/offers/offers.types"
import type { PayBillCompletionSnapshot } from "@/features/payBill/payBill.types"

export function buildPaidOfferRecordFromClaim(
  claim: ClaimedOffer,
): PaidOfferRecord {
  return {
    offerId: claim.offerId,
    restaurantSlug: claim.restaurantSlug,
    discountPercent: claim.discountPercent,
    paymentMethod: claim.paymentMethod,
    paidAt: Date.now(),
  }
}

export function buildPaidOfferRecordFromPaySnapshot(
  snapshot: PayBillCompletionSnapshot,
): PaidOfferRecord | null {
  if (!snapshot.offerId) return null
  return {
    offerId: snapshot.offerId,
    restaurantSlug: snapshot.restaurantSlug,
    restaurantName: snapshot.restaurantName,
    discountPercent: snapshot.discountPercent,
    paymentMethod: "dineout",
    paidAmountEur: snapshot.paidAmount,
    cashbackEarnedEur:
      snapshot.cashbackEarnedEur > 0 ? snapshot.cashbackEarnedEur : undefined,
    paymentCode: snapshot.paymentCode,
    receiptTotalEur: snapshot.receiptTotalEur,
    tipEur: snapshot.tipEur,
    discountAddPercent: snapshot.discountAddPercent,
    paidAt: Date.now(),
  }
}

/** Minimal claim shape for payment confirmation cashback visibility. */
export function paidOfferRecordToClaimStub(
  paid: PaidOfferRecord,
): ClaimedOffer | null {
  if (paid.paymentMethod !== "dineout" || !paid.paymentCode) return null
  return {
    pin: "",
    offerWindowCloses: new Date(paid.paidAt).toISOString(),
    arrivalTime: "",
    arrivalDate: "",
    guestCount: 0,
    paymentMethod: "dineout",
    discountPercent: paid.discountPercent,
    restaurantSlug: paid.restaurantSlug,
    offerId: paid.offerId,
    claimedAt: paid.paidAt,
    discountAddPercent: paid.discountAddPercent,
  }
}

export function isPaidOfferPaymentDetailsAvailable(
  paid: PaidOfferRecord,
): boolean {
  return (
    paid.paymentMethod === "dineout" &&
    paid.paymentCode != null &&
    paid.paidAmountEur != null &&
    paid.receiptTotalEur != null
  )
}
