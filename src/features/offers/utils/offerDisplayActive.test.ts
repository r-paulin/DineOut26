import { afterEach, describe, expect, it, vi } from "vitest"
import * as restaurantOffersData from "@/features/offers/data/restaurantOffers.data"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import {
  OFFER_ICON_PRE_START_GRACE_MINUTES,
  campaignTimeWindowDisplayActive,
  getOfferCampaignDiscountTextClass,
  getOfferCampaignIconChipClass,
  getOfferCampaignIconClass,
  getOfferCampaignPillClass,
  isTimedOfferDisplayActive,
  offerBadgeIconClass,
  parseCampaignTimeWindowLabel,
  restaurantTimedOfferDisplayActiveNow,
  timedOfferWindowDisplayActiveAtMinutes,
} from "./offerDisplayActive"

afterEach(() => {
  vi.restoreAllMocks()
})

function at(h: number, m: number): Date {
  return new Date(2024, 5, 15, h, m, 0, 0)
}

function offer(
  discountPercent: number,
  window: RestaurantTimedOffer["window"],
): RestaurantTimedOffer {
  return { discountPercent, window }
}

describe("timedOfferWindowDisplayActiveAtMinutes", () => {
  it("treats all-day as always display-active", () => {
    expect(
      timedOfferWindowDisplayActiveAtMinutes(0, { kind: "all-day" }),
    ).toBe(true)
    expect(
      timedOfferWindowDisplayActiveAtMinutes(23 * 60 + 59, { kind: "all-day" }),
    ).toBe(true)
  })

  it("is active inside [start − grace, end)", () => {
    const window = { kind: "range" as const, start: "19:00", end: "23:00" }
    const start = 19 * 60
    const grace = OFFER_ICON_PRE_START_GRACE_MINUTES

    expect(timedOfferWindowDisplayActiveAtMinutes(start - grace - 1, window)).toBe(
      false,
    )
    expect(timedOfferWindowDisplayActiveAtMinutes(start - grace, window)).toBe(
      true,
    )
    expect(timedOfferWindowDisplayActiveAtMinutes(start - 1, window)).toBe(true)
    expect(timedOfferWindowDisplayActiveAtMinutes(start, window)).toBe(true)
    expect(timedOfferWindowDisplayActiveAtMinutes(22 * 60 + 59, window)).toBe(
      true,
    )
    expect(timedOfferWindowDisplayActiveAtMinutes(23 * 60, window)).toBe(false)
  })
})

describe("isTimedOfferDisplayActive", () => {
  it("reflects grace before start", () => {
    const o = offer(20, { kind: "range", start: "12:00", end: "15:00" })
    expect(isTimedOfferDisplayActive(o, at(11, 44))).toBe(false)
    expect(isTimedOfferDisplayActive(o, at(11, 45))).toBe(true)
    expect(isTimedOfferDisplayActive(o, at(12, 30))).toBe(true)
    expect(isTimedOfferDisplayActive(o, at(15, 0))).toBe(false)
  })
})

describe("restaurantTimedOfferDisplayActiveNow", () => {
  it("is true when any offer is display-active", () => {
    vi.spyOn(restaurantOffersData, "getRestaurantOffers").mockReturnValue([
      offer(20, { kind: "range", start: "19:00", end: "23:00" }),
      offer(15, { kind: "range", start: "10:00", end: "17:00" }),
    ])

    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(9, 44))).toBe(
      false,
    )
    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(9, 45))).toBe(
      true,
    )
    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(16, 30))).toBe(
      true,
    )
    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(18, 30))).toBe(
      false,
    )
    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(18, 44))).toBe(
      false,
    )
    expect(restaurantTimedOfferDisplayActiveNow("neiburgs", at(18, 45))).toBe(
      true,
    )
  })
})

describe("parseCampaignTimeWindowLabel", () => {
  it("parses All day and en-dash ranges", () => {
    expect(parseCampaignTimeWindowLabel("All day")).toEqual({ kind: "all-day" })
    expect(parseCampaignTimeWindowLabel("12:00–15:00")).toEqual({
      kind: "range",
      start: "12:00",
      end: "15:00",
    })
    expect(parseCampaignTimeWindowLabel("garbled")).toBeNull()
  })
})

describe("campaignTimeWindowDisplayActive", () => {
  it("uses grace for campaign copy", () => {
    expect(
      campaignTimeWindowDisplayActive("12:00–15:00", at(11, 44)),
    ).toBe(false)
    expect(
      campaignTimeWindowDisplayActive("12:00–15:00", at(11, 45)),
    ).toBe(true)
    expect(campaignTimeWindowDisplayActive("All day", at(3, 0))).toBe(true)
  })
})

describe("offer campaign visual classes", () => {
  it("cardBadge uses unified white pill icon colors (Figma 16390:34941)", () => {
    expect(getOfferCampaignPillClass("cardBadge")).toBe("bg-layer-floor-1")
    expect(getOfferCampaignIconClass("cardBadge", true)).toContain(
      "text-danger-primary",
    )
    expect(getOfferCampaignIconChipClass("cardBadge", true, false)).toBeNull()
    expect(getOfferCampaignIconClass("cardBadge", false)).toContain("text-tertiary")
  })

  it("mapPin uses white pill; selected uses danger primary", () => {
    expect(getOfferCampaignPillClass("mapPin")).toBe("bg-layer-floor-1")
    expect(getOfferCampaignPillClass("mapPinSelected")).toBe("bg-danger-primary")
    expect(getOfferCampaignIconClass("mapPin", true)).toContain(
      "text-danger-primary",
    )
    expect(getOfferCampaignIconClass("mapPin", false)).toContain("text-tertiary")
    expect(getOfferCampaignIconClass("mapPinSelected", true)).toContain(
      "text-static-key-light",
    )
    expect(getOfferCampaignDiscountTextClass("mapPinSelected")).toContain(
      "text-static-key-light",
    )
  })

  it("offerBadgeIconClass delegates to cardBadge", () => {
    expect(offerBadgeIconClass(true)).toBe(
      getOfferCampaignIconClass("cardBadge", true),
    )
  })
})
