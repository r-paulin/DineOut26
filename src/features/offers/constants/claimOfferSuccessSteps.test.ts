import { describe, expect, it } from "vitest"
import { getClaimOfferSuccessSteps } from "./claimOfferSuccessSteps"

describe("getClaimOfferSuccessSteps", () => {
  it("returns three DineOut steps per Figma 17327:18233", () => {
    const steps = getClaimOfferSuccessSteps("dineout")
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => s.title)).toEqual([
      "Check in with your code",
      "Ask for the bill when ready",
      "Pay with Bolt Food",
    ])
  })

  it("returns three card/cash steps per Figma 17327:18251", () => {
    const steps = getClaimOfferSuccessSteps("card_or_cash")
    expect(steps).toHaveLength(3)
    expect(steps.map((s) => s.title)).toEqual([
      "Check in with your code",
      "Ask for the bill when ready",
      "Pay by card or cash",
    ])
  })

  it("uses shared check-in copy for both payment methods", () => {
    const dineout = getClaimOfferSuccessSteps("dineout")[0]
    const cardOrCash = getClaimOfferSuccessSteps("card_or_cash")[0]
    expect(dineout).toEqual(cardOrCash)
    expect(dineout?.subtitle).toContain("code")
  })
})
