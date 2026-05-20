import { describe, expect, it } from "vitest"
import type { TimedOfferWindow } from "@/features/offers/data/restaurantOffers.types"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import { buildTimedOfferBadgeModels } from "@/features/offers/utils/offerBadgeStack"
import {
  RESTAURANT_CATALOG_ORDER,
  RESTAURANTS_BY_SLUG,
} from "./restaurants.catalog"

const SAT_NOON = new Date(2024, 5, 15, 12, 30, 0, 0)

/** Prototype venue service hours (Mon–Tue, Thu–Sun). */
const VENUE_OPEN_START = 12 * 60
const VENUE_OPEN_END = 23 * 60

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (Number.isFinite(m) ? m : 0)
}

function rangeMinutes(w: Extract<TimedOfferWindow, { kind: "range" }>): [number, number] {
  return [hhmmToMinutes(w.start), hhmmToMinutes(w.end)]
}

function rangesOverlapHalfOpen(
  a: [number, number],
  b: [number, number],
): boolean {
  return a[0] < b[1] && b[0] < a[1]
}

describe("restaurants.catalog timed offers", () => {
  it("canonical catalog has no all-day windows", () => {
    for (const slug of RESTAURANT_CATALOG_ORDER) {
      const offers = RESTAURANTS_BY_SLUG[slug].timedOffers
      for (const o of offers) {
        expect(o.window.kind).toBe("range")
      }
    }
  })

  it("canonical offers do not overlap and sit within venue hours", () => {
    for (const slug of RESTAURANT_CATALOG_ORDER) {
      const offers = RESTAURANTS_BY_SLUG[slug].timedOffers
      const ranges = offers.map((o) => {
        expect(o.window.kind).toBe("range")
        const w = o.window as Extract<TimedOfferWindow, { kind: "range" }>
        const [start, end] = rangeMinutes(w)
        expect(start).toBeGreaterThanOrEqual(VENUE_OPEN_START)
        expect(end).toBeLessThanOrEqual(VENUE_OPEN_END)
        expect(start).toBeLessThan(end)
        return [start, end] as [number, number]
      })
      for (let i = 0; i < ranges.length; i += 1) {
        for (let j = i + 1; j < ranges.length; j += 1) {
          expect(
            rangesOverlapHalfOpen(ranges[i]!, ranges[j]!),
            `${slug}: offers ${i} and ${j} overlap`,
          ).toBe(false)
        }
      }
    }
  })

  it("merged offers never surface All day on badges", () => {
    for (const slug of RESTAURANT_CATALOG_ORDER) {
      const offers = getRestaurantOffers(slug)
      const rows = buildTimedOfferBadgeModels(offers, SAT_NOON)
      for (const row of rows) {
        if (row.kind === "offer") {
          expect(row.timeWindow).not.toBe("All day")
        }
      }
    }
  })
})
