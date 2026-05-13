import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"

export function findOfferCardById(
  model: RestaurantDetailModel,
  offerId: string,
): RestaurantOfferCardModel | undefined {
  for (const tabId of Object.keys(model.offersByTabId)) {
    const found = model.offersByTabId[tabId]?.find((c) => c.id === offerId)
    if (found) return found
  }
  return undefined
}

export function mapOfferCardToClaimModalOffer(
  card: RestaurantOfferCardModel,
): ClaimOfferModalOffer {
  return {
    id: card.id,
    title: card.title,
    restaurantName: card.restaurantName ?? "Restaurant",
    discountPercent: card.discountPercent,
    date: card.date,
    offerScheduleDate: card.offerScheduleDate,
    offerStart: card.offerStart ?? "12:00",
    offerEnd: card.offerEnd ?? "23:00",
    isAllDay: Boolean(card.isAllDay),
    workingHoursStart: card.workingHoursStart ?? "12:00",
    workingHoursEnd: card.workingHoursEnd ?? "23:00",
    paymentPromoText: card.paymentPromoText,
  }
}
