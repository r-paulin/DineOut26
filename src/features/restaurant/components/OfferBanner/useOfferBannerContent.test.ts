import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  buildOfferBannerContent,
  buildPaidOfferBannerContent,
  buildStaticOfferBannerContent,
  formatLimitedAvailabilityLabel,
  formatOfferBannerArrivalLine,
  formatOfferBannerCashbackEarnedLabel,
  formatOfferBannerClaimedDiscountLine,
  formatOfferBannerDineOutUpsellSticker,
  formatOfferBannerMinMaxLine,
  formatOfferBannerPaidAmountLine,
  formatOfferBannerTitle,
  OFFER_BANNER_PAID_CASH_SUBTITLE,
  roundMaxSavingEurUp,
} from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"
import type { PaidOfferRecord } from "@/features/offers/offers.types"

const baseOffer: RestaurantOfferCardModel = {
  id: "o1",
  expiresAt: Number.MAX_SAFE_INTEGER,
  tags: ["enabled"],
  discountPercent: 30,
  title: "Claim 30% discount on food",
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
    expect(formatOfferBannerTitle(20)).toBe("20% discount on food")
  })

  it("uses food copy for 10% all-day", () => {
    expect(formatOfferBannerTitle(10, true)).toBe("10% discount on food")
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

describe("buildOfferBannerContent — claimed without claim record", () => {
  it("falls through to available copy when state is claimed but claim is missing", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.action?.kind).toBe("claim-now")
    expect(c.action?.label).toMatch(/claim offer/i)
    expect(c.outerClaimed).toBe(false)
  })
})

describe("buildOfferBannerContent", () => {
  it("active window: Claim offer, no sticker, schedule line only", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe("30% discount on food")
    expect(c.dataLines).toHaveLength(1)
    expect(c.dataLines[0]?.text).toContain("Today")
    expect(c.action).toEqual({
      kind: "claim-now",
      label: "Claim offer",
      disabled: false,
    })
    expect(c.sticker).toBeNull()
  })

  it("prebook: Claim offer with availability sticker when one spot left", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: { ...baseOffer, remainingCount: 1 },
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.action).toEqual({
      kind: "claim-now",
      label: "Claim offer",
      disabled: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "Limited availability — 1 left",
    })
    expect(c.outerShellTone).toBe("danger")
  })

  it("prebook: no availability sticker when more than one spot left", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.sticker).toBeNull()
    expect(c.outerShellTone).toBe("neutral")
  })

  it("locked: disabled Claim offer and lock sticker", () => {
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

  it("restaurant claimed shows discount headline, date secondary, Active action", () => {
    const c = buildOfferBannerContent({
      state: "claimed",
      offer: baseOffer,
      claim,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe(formatOfferBannerClaimedDiscountLine(30))
    expect(c.dataLines).toEqual([
      {
        text: formatOfferBannerArrivalLine(claim),
        emphasis: "regular",
        tone: "primary",
      },
    ])
    expect(c.action).toEqual({
      kind: "claimed",
      label: "Active",
      disabled: false,
    })
    expect(c.sticker).toEqual({ kind: "countdown" })
    expect(c.ariaLabel).toBe(
      `${formatOfferBannerClaimedDiscountLine(30)}, ${formatOfferBannerArrivalLine(claim)}`,
    )
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
    expect(c.dataLines).toHaveLength(2)
    expect(c.dataLines[0]?.text).toBe(formatOfferBannerArrivalLine(claim))
    expect(c.dataLines[0]?.emphasis).toBe("accent")
    expect(c.dataLines[1]?.text).toBe("30% discount")
    expect(c.dataLines[1]?.tone).toBe("secondary")
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

describe("paid offer banner copy", () => {
  it("formats paid amount and cashback earned labels", () => {
    expect(formatOfferBannerPaidAmountLine(48)).toBe("Paid: 48,00 €")
    expect(formatOfferBannerCashbackEarnedLabel(5)).toBe("€5 cashback earned")
    expect(formatOfferBannerCashbackEarnedLabel(1.8)).toBe("€1,80 cashback earned")
    expect(formatOfferBannerDineOutUpsellSticker()).toBe(
      "Pay with DineOut next time and earn 15% back",
    )
  })
})

describe("buildPaidOfferBannerContent", () => {
  const dineoutPaid: PaidOfferRecord = {
    offerId: "o1",
    restaurantSlug: "neiburgs",
    discountPercent: 30,
    paymentMethod: "dineout",
    paidAmountEur: 48,
    cashbackEarnedEur: 5,
    paidAt: Date.now(),
  }

  const cashPaid: PaidOfferRecord = {
    offerId: "o1",
    restaurantSlug: "neiburgs",
    discountPercent: 30,
    paymentMethod: "card_or_cash",
    paidAt: Date.now(),
  }

  it("DineOut paid: discount title, paid line, cashback action", () => {
    const c = buildPaidOfferBannerContent({ paid: dineoutPaid, offer: baseOffer })
    expect(c.headline).toBe("30% discount on food")
    expect(c.dataLines[0]?.text).toBe("Paid: 48,00 €")
    expect(c.action).toEqual({
      kind: "cashback-earned",
      label: "€5 cashback earned",
      disabled: false,
    })
    expect(c.sticker).toBeNull()
    expect(c.outerClaimed).toBe(true)
  })

  it("card/cash paid: subtitle and upsell sticker", () => {
    const c = buildPaidOfferBannerContent({ paid: cashPaid, offer: baseOffer })
    expect(c.headline).toBe("30% discount on food")
    expect(c.dataLines[0]?.text).toBe(OFFER_BANNER_PAID_CASH_SUBTITLE)
    expect(c.action).toBeNull()
    expect(c.sticker).toEqual({
      kind: "dineout-upsell",
      text: "Pay with DineOut next time and earn 15% back",
    })
  })
})
