import { describe, expect, it } from "vitest"
import type { RestaurantTimedOffer } from "@/features/offers/data/restaurantOffers.types"
import {
  buildTimedOfferBadgeModels,
  formatBadgeTimeLabel,
  formatCampaignBadgeTimeLabel,
  isOfferLiveForBadge,
  isTimedOfferExpiredToday,
  isVenueOpenNow,
  sortOffersForBadgeDisplay,
} from "./offerBadgeStack"

/** Saturday — used when prototype venue hours are closed. */
const SAT_1150 = new Date(2024, 5, 15, 11, 50, 0, 0)
const SAT_1230 = new Date(2024, 5, 15, 12, 30, 0, 0)
/** Wednesday — venue open 11:00–21:00 in prototype grid. */
const WED_1230 = new Date(2024, 5, 12, 12, 30, 0, 0)
/** Before venue opens. */
const SAT_1000 = new Date(2024, 5, 15, 10, 0, 0, 0)

function offer(
  discountPercent: number,
  window: RestaurantTimedOffer["window"],
): RestaurantTimedOffer {
  return { discountPercent, window }
}

describe("isTimedOfferExpiredToday", () => {
  it("is true when now is at or past range end", () => {
    const o = offer(10, { kind: "range", start: "09:00", end: "10:00" })
    expect(isTimedOfferExpiredToday(o, SAT_1150)).toBe(true)
    expect(isTimedOfferExpiredToday(o, new Date(2024, 5, 15, 9, 30, 0, 0))).toBe(
      false,
    )
  })

  it("all-day is never expired for badges", () => {
    expect(
      isTimedOfferExpiredToday(offer(10, { kind: "all-day" }), SAT_1150),
    ).toBe(false)
  })
})

describe("isVenueOpenNow", () => {
  it("is false before 12:00 on a weekday in the prototype grid", () => {
    expect(isVenueOpenNow(SAT_1000)).toBe(false)
  })

  it("is true during service hours", () => {
    expect(isVenueOpenNow(WED_1230)).toBe(true)
  })
})

describe("formatBadgeTimeLabel", () => {
  it("uses Until end when the offer window is live", () => {
    const o = offer(20, { kind: "range", start: "11:00", end: "14:00" })
    expect(formatBadgeTimeLabel(o, SAT_1230)).toBe("Until 14:00")
  })

  it("uses Until end when live even if prototype venue hours are closed", () => {
    const o = offer(20, { kind: "range", start: "19:00", end: "23:00" })
    const sat2111 = new Date(2024, 5, 15, 21, 11, 0, 0)
    expect(isVenueOpenNow(sat2111)).toBe(false)
    expect(formatBadgeTimeLabel(o, sat2111)).toBe("Until 23:00")
  })

  it("uses range when the window has not started yet", () => {
    const o = offer(20, { kind: "range", start: "09:00", end: "17:00" })
    const beforeOpen = new Date(2024, 5, 15, 8, 0, 0, 0)
    expect(formatBadgeTimeLabel(o, beforeOpen)).toBe("09:00–17:00")
  })
})

describe("formatCampaignBadgeTimeLabel", () => {
  it("uses Until end for live campaign pill copy", () => {
    const sat2111 = new Date(2024, 5, 15, 21, 11, 0, 0)
    expect(formatCampaignBadgeTimeLabel("19:00–23:00", sat2111)).toBe(
      "Until 23:00",
    )
  })

  it("keeps full range before the window starts", () => {
    const beforeOpen = new Date(2024, 5, 15, 18, 0, 0, 0)
    expect(formatCampaignBadgeTimeLabel("19:00–23:00", beforeOpen)).toBe(
      "19:00–23:00",
    )
  })
})

describe("sortOffersForBadgeDisplay", () => {
  it("puts live offer first ahead of higher discount", () => {
    const sorted = sortOffersForBadgeDisplay(
      [
        offer(25, { kind: "range", start: "18:00", end: "22:00" }),
        offer(15, { kind: "range", start: "11:00", end: "14:00" }),
      ],
      SAT_1230,
    )
    expect(sorted[0]?.discountPercent).toBe(15)
  })

  it("breaks equal discount by earlier start", () => {
    const sorted = sortOffersForBadgeDisplay(
      [
        offer(20, { kind: "range", start: "14:00", end: "16:00" }),
        offer(20, { kind: "range", start: "12:00", end: "13:00" }),
      ],
      SAT_1150,
    )
    expect(sorted.map((o) => o.window)).toEqual([
      { kind: "range", start: "12:00", end: "13:00" },
      { kind: "range", start: "14:00", end: "16:00" },
    ])
  })
})

describe("buildTimedOfferBadgeModels", () => {
  it("returns empty for no offers", () => {
    expect(buildTimedOfferBadgeModels([])).toEqual([])
  })

  it("maps a single non-expired offer", () => {
    const rows = buildTimedOfferBadgeModels(
      [offer(20, { kind: "range", start: "12:00", end: "15:00" })],
      SAT_1230,
    )
    expect(rows).toEqual([
      {
        kind: "offer",
        discountLabel: "-20%",
        timeWindow: "Until 15:00",
        iconActive: true,
      },
    ])
  })

  it("shows two badges for two eligible offers", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(20, { kind: "range", start: "11:00", end: "14:00" }),
        offer(15, { kind: "range", start: "18:00", end: "22:00" }),
      ],
      SAT_1230,
    )
    expect(rows).toHaveLength(2)
    expect(rows.every((r) => r.kind === "offer")).toBe(true)
    expect(rows[0]).toMatchObject({ discountLabel: "-20%", timeWindow: "Until 14:00" })
  })

  it("shows one badge and +2 offers for three eligible offers", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(10, { kind: "range", start: "14:00", end: "16:00" }),
        offer(20, { kind: "range", start: "11:00", end: "14:00" }),
        offer(15, { kind: "range", start: "18:00", end: "22:00" }),
      ],
      SAT_1230,
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({
      kind: "offer",
      discountLabel: "-20%",
      timeWindow: "Until 14:00",
    })
    expect(rows[1]).toEqual({
      kind: "overflow",
      count: 2,
      iconActive: true,
    })
  })

  it("shows one badge and +4 offers for five eligible offers", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(5, { kind: "range", start: "14:00", end: "15:00" }),
        offer(10, { kind: "range", start: "12:00", end: "13:00" }),
        offer(25, { kind: "range", start: "11:00", end: "14:00" }),
        offer(20, { kind: "range", start: "18:00", end: "22:00" }),
        offer(15, { kind: "range", start: "12:05", end: "13:30" }),
      ],
      SAT_1230,
    )
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ kind: "offer", discountLabel: "-25%" })
    expect(rows[1]).toEqual({ kind: "overflow", count: 4, iconActive: true })
  })

  it("shows one badge and +3 offers for four eligible offers", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(10, { kind: "range", start: "14:00", end: "16:00" }),
        offer(25, { kind: "range", start: "11:00", end: "14:00" }),
        offer(20, { kind: "range", start: "18:00", end: "22:00" }),
        offer(15, { kind: "range", start: "12:00", end: "13:00" }),
      ],
      SAT_1230,
    )
    expect(rows).toHaveLength(2)
    expect(rows[1]).toEqual({ kind: "overflow", count: 3, iconActive: true })
  })

  it("omits expired offers and returns empty when all expired", () => {
    const expired = offer(10, { kind: "range", start: "09:00", end: "10:00" })
    expect(buildTimedOfferBadgeModels([expired], SAT_1150)).toEqual([])
    const rows = buildTimedOfferBadgeModels(
      [
        expired,
        offer(20, { kind: "range", start: "11:00", end: "14:00" }),
      ],
      SAT_1150,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ discountLabel: "-20%" })
  })

  it("live offer is slot 1 with Until copy when a higher claimable offer exists", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(25, { kind: "range", start: "18:00", end: "22:00" }),
        offer(15, { kind: "range", start: "11:00", end: "14:00" }),
      ],
      SAT_1230,
    )
    expect(rows[0]).toMatchObject({
      discountLabel: "-15%",
      timeWindow: "Until 14:00",
    })
  })

  it("liveNow mode shows only the live badge", () => {
    const rows = buildTimedOfferBadgeModels(
      [
        offer(10, { kind: "range", start: "09:00", end: "10:00" }),
        offer(25, { kind: "range", start: "11:00", end: "14:00" }),
        offer(20, { kind: "range", start: "18:00", end: "22:00" }),
      ],
      SAT_1230,
      "liveNow",
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      kind: "offer",
      discountLabel: "-25%",
      timeWindow: "Until 14:00",
    })
  })

  it("liveNow mode returns empty when nothing is live for badge", () => {
    expect(
      buildTimedOfferBadgeModels(
        [offer(20, { kind: "range", start: "18:00", end: "22:00" })],
        SAT_1000,
        "liveNow",
      ),
    ).toEqual([])
  })
})
