import type { ClaimedOffer } from "@/features/offers/offers.types"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"

/**
 * Percents for the pay / confirmation stack.
 *
 * **DineOut:** `discountPercent` is always **0** — the receipt the guest entered is already net
 * of the claimed offer. `discountAddPercent` is **post-payment cashback %** on (receipt + tip),
 * not a second checkout discount (see {@link payAmountDue} / {@link cashbackAmountEur}).
 *
 * **Non–DineOut (e.g. card/cash at venue):** `discountPercent` reduces amount due at the venue;
 * add-on is 0.
 *
 * Cashback % uses {@link DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT} when paying with DineOut and the
 * claim does not pin `discountAddPercent` (including `offer === null`).
 */
export function effectivePayDiscountPercents(offer: ClaimedOffer | null): {
  discountPercent: number
  discountAddPercent: number
} {
  const claimedPercent = offer?.discountPercent ?? 0
  const method = offer?.paymentMethod ?? "dineout"
  if (method !== "dineout") {
    return { discountPercent: claimedPercent, discountAddPercent: 0 }
  }
  const discountAddPercent =
    offer != null && typeof offer.discountAddPercent === "number" ?
      offer.discountAddPercent
    : DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT
  return { discountPercent: 0, discountAddPercent }
}
