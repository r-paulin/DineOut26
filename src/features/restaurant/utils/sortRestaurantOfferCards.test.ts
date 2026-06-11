import { describe, expect, it } from "vitest"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import { sortRestaurantOfferCardsByStartTime } from "./sortRestaurantOfferCards"

const FAR_FUTURE_MS = 4102444800000

function offerCard(
  id: string,
  overrides: Partial<RestaurantOfferCardModel> = {},
): RestaurantOfferCardModel {
  return {
    id,
    expiresAt: FAR_FUTURE_MS,
    tags: ["enabled"],
    discountPercent: 10,
    title: "Claim 10% off your bill",
    date: "Today",
    timeWindow: "All day",
    restaurantImage: "/images/placeholder.png",
    ...overrides,
  }
}

describe("sortRestaurantOfferCardsByStartTime", () => {
  it("orders offers by offerStart ascending", () => {
    const lunch = offerCard("lunch", {
      offerStart: "12:00",
      offerEnd: "17:00",
      discountPercent: 15,
    })
    const dinner = offerCard("dinner", {
      offerStart: "19:00",
      offerEnd: "23:00",
      discountPercent: 20,
    })
    const sorted = sortRestaurantOfferCardsByStartTime([dinner, lunch])
    expect(sorted.map((x) => x.id)).toEqual(["lunch", "dinner"])
  })

  it("places all-day offers before timed windows", () => {
    const allDay = offerCard("all-day", { isAllDay: true, offerStart: "10:00" })
    const evening = offerCard("evening", {
      offerStart: "19:00",
      offerEnd: "23:00",
    })
    const sorted = sortRestaurantOfferCardsByStartTime([evening, allDay])
    expect(sorted.map((x) => x.id)).toEqual(["all-day", "evening"])
  })

  it("places offers without a start time last", () => {
    const timed = offerCard("timed", { offerStart: "12:00", offerEnd: "14:00" })
    const unknown = offerCard("unknown")
    const sorted = sortRestaurantOfferCardsByStartTime([unknown, timed])
    expect(sorted.map((x) => x.id)).toEqual(["timed", "unknown"])
  })
})
