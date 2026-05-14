/**
 * Extra % off (receipt + tip) when paying with DineOut, on top of the receipt total the guest
 * already entered (that total is treated as already including any claimed-offer discount).
 * Applies even without a claimed offer unless the claim explicitly sets {@link ClaimedOffer.discountAddPercent}.
 */
export const DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT = 40
