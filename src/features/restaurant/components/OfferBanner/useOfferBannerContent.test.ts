import { describe, expect, it } from "vitest"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import type { RestaurantOfferCardModel } from "@/features/restaurant/restaurantDetail.types"
import {
  buildOfferBannerContent,
  buildPaidOfferBannerContent,
  buildStaticOfferBannerContent,
  formatClaimSlotsRemainingLabel,
  formatLimitedAvailabilityLabel,
  formatOfferBannerAvailabilityTime,
  formatOfferBannerArrivalLine,
  formatOfferBannerCashbackEarnedStickerLabel,
  formatOfferBannerClaimedDiscountLine,
  formatOfferBannerDineOutUpsellSticker,
  formatOfferBannerMinMaxLine,
  formatOfferBannerPaidAmountLine,
  formatOfferBannerTotalBillLine,
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
  title: "Claim 30% off your bill",
  date: "Today",
  timeWindow: "Arrive between 19:00 - 23:00",
  restaurantImage: "/x.jpg",
  restaurantName: "3 Pavāru Restorāns",
  minOrderEur: 10,
  maxSavingEur: 40,
  remainingCount: 2,
  offerStart: "19:00",
  offerEnd: "23:00",
  isAllDay: false,
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
    expect(formatOfferBannerTitle(20)).toBe("20% off your bill")
  })

  it("uses food copy for 10% all-day", () => {
    expect(formatOfferBannerTitle(10, true)).toBe("10% off your bill")
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

describe("formatClaimSlotsRemainingLabel", () => {
  it("uses Only prefix when fewer than three spots remain", () => {
    expect(formatClaimSlotsRemainingLabel(2)).toBe("Only 2 offers left")
    expect(formatClaimSlotsRemainingLabel(1)).toBe("Only 1 offer left")
  })

  it("uses plain count when three or more spots remain", () => {
    expect(formatClaimSlotsRemainingLabel(3)).toBe("3 offers left")
    expect(formatClaimSlotsRemainingLabel(5)).toBe("5 offers left")
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

describe("formatOfferBannerAvailabilityTime", () => {
  it("uses Until end when the offer window is active now", () => {
    expect(
      formatOfferBannerAvailabilityTime("Arrive between 19:00 - 23:00", {
        windowPhase: "active",
        isAllDay: false,
        offerEnd: "23:00",
      }),
    ).toBe("Until 23:00")
  })

  it("keeps the full range when pre-booking", () => {
    expect(
      formatOfferBannerAvailabilityTime("Arrive between 19:00 - 23:00", {
        windowPhase: "prebook",
        isAllDay: false,
        offerEnd: "23:00",
      }),
    ).toBe("19:00 - 23:00")
  })

  it("keeps all-day copy when active", () => {
    expect(
      formatOfferBannerAvailabilityTime("All day", {
        windowPhase: "active",
        isAllDay: true,
        offerEnd: "23:00",
      }),
    ).toBe("All day")
  })
})

describe("buildOfferBannerContent", () => {
  it("active window: Claim offer with scarcity sticker when slots remain", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.headline).toBe("30% off your bill")
    expect(c.dataLines).toHaveLength(1)
    expect(c.dataLines[0]?.text).toBe("Today · Until 23:00")
    expect(c.action).toEqual({
      kind: "claim-now",
      label: "Claim offer",
      disabled: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "Only 2 offers left",
    })
    expect(c.outerShellTone).toBe("limited")
  })

  it("active window: scarcity sticker when more than two spots remain", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: { ...baseOffer, remainingCount: 3 },
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "3 offers left",
    })
    expect(c.outerShellTone).toBe("limited")
  })

  it("active window: no sticker when remaining count is missing", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: { ...baseOffer, remainingCount: undefined },
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "active",
      hasOtherClaimAtVenue: false,
    })
    expect(c.sticker).toBeNull()
    expect(c.outerShellTone).toBe("neutral")
  })

  it("prebook: Claim offer with full schedule range before window opens", () => {
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
    expect(c.dataLines[0]?.text).toBe("Today · 19:00 - 23:00")
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "Only 1 offer left",
    })
    expect(c.outerShellTone).toBe("limited")
  })

  it("prebook: availability sticker when two or fewer spots remain", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: baseOffer,
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "Only 2 offers left",
    })
    expect(c.outerShellTone).toBe("limited")
  })

  it("prebook: scarcity sticker when five spots remain", () => {
    const c = buildOfferBannerContent({
      state: "available",
      offer: { ...baseOffer, remainingCount: 5 },
      claim: undefined,
      context: "restaurant",
      displayDiscount: 30,
      windowPhase: "prebook",
      hasOtherClaimAtVenue: false,
    })
    expect(c.sticker).toEqual({
      kind: "scarcity",
      text: "5 offers left",
    })
    expect(c.outerShellTone).toBe("limited")
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
  it("formats total bill and cashback earned labels", () => {
    expect(formatOfferBannerTotalBillLine(48)).toBe("Total bill: 48,00 €")
    expect(formatOfferBannerPaidAmountLine(48)).toBe("Total bill: 48,00 €")
    expect(formatOfferBannerCashbackEarnedStickerLabel(5)).toBe(
      "€5,00 cashback earned",
    )
    expect(formatOfferBannerCashbackEarnedStickerLabel(1.8)).toBe(
      "€1,80 cashback earned",
    )
    expect(formatOfferBannerDineOutUpsellSticker()).toBe(
      "Pay with Bolt Food and earn 15% back",
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

  it("DineOut paid: discount title, total bill line, paid action, cashback sticker", () => {
    const c = buildPaidOfferBannerContent({ paid: dineoutPaid, offer: baseOffer })
    expect(c.headline).toBe("30% off your bill")
    expect(c.dataLines[0]?.text).toBe("Total bill: 48,00 €")
    expect(c.dataLines[0]?.typography).toBe("compact-regular")
    expect(c.innerSurface).toBe("paid")
    expect(c.action).toEqual({
      kind: "paid",
      label: "Paid",
      disabled: false,
    })
    expect(c.sticker).toEqual({
      kind: "cashback-earned",
      text: "€5,00 cashback earned",
    })
    expect(c.outerClaimed).toBe(true)
  })

  it("card/cash paid: subtitle and upsell sticker", () => {
    const c = buildPaidOfferBannerContent({ paid: cashPaid, offer: baseOffer })
    expect(c.headline).toBe("30% off your bill")
    expect(c.dataLines[0]?.text).toBe(OFFER_BANNER_PAID_CASH_SUBTITLE)
    expect(c.action).toBeNull()
    expect(c.sticker).toEqual({
      kind: "dineout-upsell",
      text: "Pay with Bolt Food and earn 15% back",
    })
  })
})
