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

/**
 * Build badge label for {@link PayBillFlowEntry.billAmountBadges} from detail.
 * Claimed-offer % is not shown as a pill (see {@link ClaimedOfferBillInlineNotice}).
 */
export function buildPayBillAmountBadges(model: RestaurantDetailModel): PayBillAmountBadges {
  const defaultLabel = hasVenueOfferRows(model) ? DINEOUT_PAY_BILL_BADGE_LABEL : null
  return { defaultLabel }
}
