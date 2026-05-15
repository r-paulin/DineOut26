import { describe, expect, it } from "vitest"
import { formatClaimedOfferMenuLabel } from "./claimedOfferShared"

describe("formatClaimedOfferMenuLabel", () => {
  it("formats percent and menu copy per Figma", () => {
    expect(formatClaimedOfferMenuLabel(30)).toBe("30% discount on menu")
  })
})
