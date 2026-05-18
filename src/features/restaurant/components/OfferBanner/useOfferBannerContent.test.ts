import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  buildOfferBannerContent,
  buildStaticOfferBannerContent,
  formatLimitedAvailabilityLabel,
  formatOfferBannerArrivalLine,
  formatOfferBannerMinMaxLine,
  formatOfferBannerTitle,
  roundMaxSavingEurUp,
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
  minOrderEur: 10,
  maxSavingEur: 40,
  remainingCount: 2,
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
  minOrderEur: 10,
  maxSavingEur: 40,
}

describe("formatOfferBannerTitle", () => {
  it("formats discount headline", () => {
    expect(formatOfferBannerTitle(20)).toBe("20% discount on menu")
  })

  it("uses Daily menu for 10% all-day", () => {
    expect(formatOfferBannerTitle(10, true)).toBe(
      "10% discount on Daily menu",
    )
  })
})

describe("roundMaxSavingEurUp", () => {
  it("ceil's fractional savings to whole euros", () => {
    expect(roundMaxSavingEurUp(26.67)).toBe(27)
    expect(roundMaxSavingEurUp(40)).toBe(40)
  })
})

describe("formatOfferBannerMinMaxLine", () => {
  it("formats min with decimals and max saving as a round euro amount", () => {
    expect(formatOfferBannerMinMaxLine(10, 40)).toBe(
      "Min. order 10.00€ · Max. saving 40€",
    )
    expect(formatOfferBannerMinMaxLine(10, 26.67)).toBe(
      "Min. order 10.00€ · Max. saving 27€",
    )
  })
})

describe("formatLimitedAvailabilityLabel", () => {
  it("uses em dash and count", () => {
    expect(formatLimitedAvailabilityLabel(2)).toBe(
      "Limited availability — 2 left",
    )
  })
})

describe("buildOfferBannerContent", () => {
  it("active window: Claim now, no sticker, min/max lines", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe("30% discount on menu")
    expect(c.dataLines[1]?.text).toBe("Min. order 10.00€ · Max. saving 40€")
    expect(c.action).toEqual({
      kind: "claim-now",
      label: "Claim now",
      disabled: false,
    })
    expect(c.sticker).toBeNull()
  })

  it("prebook: Pre-book now with availability sticker", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.action).toEqual({
      kind: "pre-book-now",
      label: "Pre-book now",
      disabled: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "Limited availability — 2 left",
    })
  })

  it("locked: disabled Claim now and lock sticker", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: true,
    })
    expect(c.action?.disabled).toBe(true)
    expect(c.sticker).toEqual({
      kind: "locked",
      text: "One offer per restaurant per day",
    })
  })

  it("expired state disables claim and shows expired sticker", () => {
    const c = buildOfferBannerContent({
      state: "expired",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.action?.disabled).toBe(true)
    expect(c.sticker).toEqual({
      kind: "expired",
      text: "Offer has expired",
    })
  })

  it("restaurant claimed uses arrival headline and min/max", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe(formatOfferBannerArrivalLine(claim))
    expect(c.dataLines[0]?.text).toContain("Min. order")
    expect(c.sticker).toEqual({ kind: "countdown" })
  })

  it("home claimed uses restaurant name", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim,
      context: "home",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe("3 Pavāru Restorāns")
    expect(c.dataLines[0]?.text).toBe(formatOfferBannerArrivalLine(claim))
  })
})

describe("buildStaticOfferBannerContent", () => {
  it("omits action and sticker", () => {
    const c = buildStaticOfferBannerContent({
      title: "40% discount for your first 2 orders",
      subtitle: "Valid when paying through DineOut",
    })
    expect(c.action).toBeNull()
    expect(c.sticker).toBeNull()
  })
})
