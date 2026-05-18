import { describe, expect, it } from "vitest"
import { formatReviewCountForBadge } from "./OfferCardImageRatingBadge"

describe("formatReviewCountForBadge", () => {
  it("wraps bare counts in parentheses", () => {
    expect(formatReviewCountForBadge("200+")).toBe("(200+)")
  })

  it("keeps already parenthesized values", () => {
    expect(formatReviewCountForBadge("(200+)")).toBe("(200+)")
  })

  it("returns undefined for empty input", () => {
    expect(formatReviewCountForBadge("")).toBeUndefined()
    expect(formatReviewCountForBadge(undefined)).toBeUndefined()
  })
})
