import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"
import type { PayBillAmountBadges } from "@/features/payBill/payBill.types"

/** DineOut payment benefit shown on bill amount when the venue has offer rows (not card headline %). */
const DINEOUT_PAY_BILL_BADGE_LABEL = "40% off"

function hasVenueOfferRows(model: RestaurantDetailModel): boolean {
  for (const tab of model.offerDateTabs) {
    if (tab.state === "no-offer") continue
    const cards = model.offersByTabId[tab.id] ?? []
    if (cards.length > 0) return true
  }
  return false
}

/** Bill-amount pills: short `N% off` only (no marketing copy from {@link ClaimedOffer.promoText}). */
function formatDiscountPercentOff(percent: number): string {
  if (!Number.isFinite(percent) || percent < 0) return "0% off"
  const rounded = Math.round(percent * 100) / 100
  const text =
    Number.isInteger(rounded) ? String(rounded) : String(parseFloat(rounded.toFixed(2)))
  return `${text}% off`
}

function claimedOfferBadgeLabel(claim: ClaimedOffer): string {
  return formatDiscountPercentOff(claim.discountPercent)
}

/** Build badge labels for {@link PayBillFlowEntry.billAmountBadges} from detail + optional claim. */
export function buildPayBillAmountBadges(
  model: RestaurantDetailModel,
  claim: ClaimedOffer | null,
): PayBillAmountBadges {
  const defaultLabel = hasVenueOfferRows(model) ? DINEOUT_PAY_BILL_BADGE_LABEL : null
  const claimedLabel = claim ? claimedOfferBadgeLabel(claim) : null
  return { defaultLabel, claimedLabel }
}
