import { describe, expect, it } from "vitest"
import {
  getOfferBannerState,
  resolveEffectiveBannerState,
  shouldShowOfferBanner,
  type UserClaim,
} from "./offerState"

describe("getOfferBannerState", () => {
  const offer = (id: string, expiresAt: number) => ({ id, expiresAt })

  it("never returns claimed when userClaims is empty", () => {
    const now = 1_700_000_000_000
    expect(getOfferBannerState(offer("o1", now + 1), [], now)).toBe("available")
    expect(getOfferBannerState(offer("o1", now - 1), [], now)).toBe("expired")
  })

  it("ignores claims for a different offerId", () => {
    const now = 1_700_000_000_000
    const claims: UserClaim[] = [{ offerId: "other", claimedAt: now }]
    expect(getOfferBannerState(offer("o1", now + 1), claims, now)).toBe("available")
    expect(getOfferBannerState(offer("o1", now - 1), claims, now)).toBe("expired")
  })

  it("returns expired when no matching claim and expiresAt is before now", () => {
    const now = 1_700_000_000_000
    expect(getOfferBannerState(offer("o1", now - 1), [], now)).toBe("expired")
  })

  it("returns available when no claim and expiresAt is after now", () => {
    const now = 1_700_000_000_000
    expect(getOfferBannerState(offer("o1", now + 1), [], now)).toBe("available")
  })

  it("returns claimed when there is a matching claim regardless of expiry", () => {
    const now = 1_700_000_000_000
    const claims: UserClaim[] = [{ offerId: "o1", claimedAt: now - 10_000 }]
    expect(getOfferBannerState(offer("o1", now + 1), claims, now)).toBe("claimed")
    expect(getOfferBannerState(offer("o1", now - 1), claims, now)).toBe("claimed")
  })

  describe("local device schedule (offerScheduleDate + offerEnd)", () => {
    const far = 4_102_444_800_000

    it("expires after offerEnd on the same local calendar day", () => {
      const may11_2pm = new Date(2026, 4, 11, 14, 0, 0, 0).getTime()
      const may11_201pm = may11_2pm + 60_000
      const row = {
        id: "o-sched",
        expiresAt: far,
        offerScheduleDate: "2026-05-11" as const,
        offerEnd: "14:00",
      }
      expect(getOfferBannerState(row, [], may11_2pm)).toBe("available")
      expect(getOfferBannerState(row, [], may11_201pm)).toBe("expired")
    })

    it('resolves "today" to the device local date at nowMs', () => {
      const may11_3pm = new Date(2026, 4, 11, 15, 0, 0, 0).getTime()
      const row = {
        id: "o-today",
        expiresAt: far,
        offerScheduleDate: "today" as const,
        offerEnd: "14:00",
      }
      expect(getOfferBannerState(row, [], may11_3pm)).toBe("expired")
    })

    it("stays available when the schedule date is in the future (local)", () => {
      const may11_3pm = new Date(2026, 4, 11, 15, 0, 0, 0).getTime()
      const row = {
        id: "o-future",
        expiresAt: far,
        offerScheduleDate: "2026-05-12" as const,
        offerEnd: "14:00",
      }
      expect(getOfferBannerState(row, [], may11_3pm)).toBe("available")
    })

    it("expires when the schedule date is before today (local)", () => {
      const may12_10am = new Date(2026, 4, 12, 10, 0, 0, 0).getTime()
      const row = {
        id: "o-past-day",
        expiresAt: far,
        offerScheduleDate: "2026-05-11" as const,
        offerEnd: "23:00",
      }
      expect(getOfferBannerState(row, [], may12_10am)).toBe("expired")
    })

    it("ignores schedule when offerEnd is missing", () => {
      const may11_3pm = new Date(2026, 4, 11, 15, 0, 0, 0).getTime()
      const row = {
        id: "o-no-end",
        expiresAt: far,
        offerScheduleDate: "2026-05-11" as const,
      }
      expect(getOfferBannerState(row, [], may11_3pm)).toBe("available")
    })

    it("claimed wins over local schedule expiry", () => {
      const may11_3pm = new Date(2026, 4, 11, 15, 0, 0, 0).getTime()
      const claims: UserClaim[] = [{ offerId: "o-claimed", claimedAt: may11_3pm }]
      const row = {
        id: "o-claimed",
        expiresAt: far,
        offerScheduleDate: "2026-05-11" as const,
        offerEnd: "14:00",
      }
      expect(getOfferBannerState(row, claims, may11_3pm)).toBe("claimed")
    })
  })
})

describe("resolveEffectiveBannerState", () => {
  it("maps claimed without a claim record to available", () => {
    expect(resolveEffectiveBannerState("claimed", false)).toBe("available")
  })

  it("keeps claimed when a claim record exists", () => {
    expect(resolveEffectiveBannerState("claimed", true)).toBe("claimed")
  })

  it("passes through available and expired", () => {
    expect(resolveEffectiveBannerState("available", false)).toBe("available")
    expect(resolveEffectiveBannerState("expired", true)).toBe("expired")
  })
})

describe("shouldShowOfferBanner", () => {
  it("is true when enabled, expired, or claimed is present", () => {
    expect(shouldShowOfferBanner(["enabled"])).toBe(true)
    expect(shouldShowOfferBanner(["expired"])).toBe(true)
    expect(shouldShowOfferBanner(["claimed"])).toBe(true)
    expect(shouldShowOfferBanner(["enabled", "claimed"])).toBe(true)
  })

  it("is false when none of enabled, expired, or claimed are present", () => {
    expect(shouldShowOfferBanner([])).toBe(false)
    expect(shouldShowOfferBanner(["promo"])).toBe(false)
    expect(shouldShowOfferBanner(["vip", "featured"])).toBe(false)
  })

  it("covers pairwise absence of the three visibility tags", () => {
    const visibilityTags = ["enabled", "expired", "claimed"] as const
    for (const omit of visibilityTags) {
      const tags = visibilityTags.filter((t) => t !== omit)
      expect(shouldShowOfferBanner(tags)).toBe(true)
    }
  })
})
