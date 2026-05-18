import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  buildOfferBannerContent,
  buildStaticOfferBannerContent,
  formatOfferBannerArrivalLine,
  formatOfferBannerDiscountDetailLine,
  formatOfferBannerScheduleLine,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

const baseOffer: RestaurantOfferCardModel = {
  id: "o1",
  expiresAt: Number.MAX_SAFE_INTEGER,
  tags: ["enabled"],
  discountPercent: 30,
  title: "Claim 30% discount on menu",
  date: "Today",
  timeWindow: "Arrive between 10:00 - 17:00",
  restaurantImage: "/x.jpg",
  restaurantName: "3 Pavāru Restorāns",
}

const claim: ClaimedOffer = {
  pin: "1234",
  offerWindowCloses: new Date(Date.now() + 7200_000).toISOString(),
  arrivalTime: "10:00",
  arrivalDate: "Today",
  guestCount: 2,
  paymentMethod: "dineout",
  discountPercent: 30,
  restaurantSlug: "neiburgs",
  offerId: "o1",
  claimedAt: Date.now(),
  offerDetailLabel: "30% discount on menu",
}

describe("formatOfferBannerDiscountDetailLine", () => {
  it("includes min order with two decimals", () => {
    expect(formatOfferBannerDiscountDetailLine(30)).toBe(
      "30% discount · Min. order 10.00€",
    )
  })

  it("strips on menu suffix from detail label", () => {
    expect(
      formatOfferBannerDiscountDetailLine(30, "30% discount on menu", 15),
    ).toBe("30% discount · Min. order 15.00€")
  })
})

describe("buildOfferBannerContent", () => {
  it("available state uses title and schedule line", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
    })
    expect(c.headline).toBe(baseOffer.title)
    expect(c.dataLines[0]?.text).toBe(
      formatOfferBannerScheduleLine("Today", baseOffer.timeWindow),
    )
    expect(c.action).toEqual({
      kind: "claim-now",
      label: "Claim now",
      disabled: false,
    })
    expect(c.sticker?.kind).toBeUndefined()
    expect(c.outerClaimed).toBe(false)
  })

  it("expired state disables claim and shows expired sticker", () => {
    const c = buildOfferBannerContent({
      state: "expired",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
    })
    expect(c.action?.disabled).toBe(true)
    expect(c.sticker).toEqual({
      kind: "expired",
      text: "Offer has expired",
    })
  })

  it("restaurant claimed uses arrival as headline", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim,
      context: "restaurant",
      displayDiscount: 30,
    })
    expect(c.headline).toBe(formatOfferBannerArrivalLine(claim))
    expect(c.dataLines[0]?.text).toContain("30% discount")
    expect(c.action?.kind).toBe("claimed")
    expect(c.sticker).toEqual({ kind: "countdown" })
    expect(c.outerClaimed).toBe(true)
  })

  it("home claimed uses restaurant name as headline", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim,
      context: "home",
      displayDiscount: 30,
    })
    expect(c.headline).toBe("3 Pavāru Restorāns")
    expect(c.dataLines[0]?.text).toBe(formatOfferBannerArrivalLine(claim))
    expect(c.dataLines[1]?.tone).toBe("secondary")
  })
})

describe("buildStaticOfferBannerContent", () => {
  it("omits action and sticker", () => {
    const c = buildStaticOfferBannerContent({
      title: "40% discount for your first 2 orders",
      subtitle: "Valid when paying the bill through the Bolt Food app",
    })
    expect(c.action).toBeNull()
    expect(c.sticker).toBeNull()
    expect(c.dataLines[0]?.text).toContain("Bolt Food")
  })
})
