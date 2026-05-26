/**
 * Cashback % of (receipt + tip) credited to Bolt Balance after DineOut payment.
 * Does not reduce checkout amount due — the receipt total is already net of the claimed offer.
 * Applies even without a claimed offer unless the claim sets {@link ClaimedOffer.discountAddPercent}.
 */
export const DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT = 20
