import { describe, expect, it } from "vitest"
import {
  CLAIM_OFFER_SUCCESS_CTA,
  CLAIM_OFFER_SUCCESS_TITLE,
} from "./claimOfferSuccessCopy"

describe("claimOfferSuccessCopy (Figma 17421:31561)", () => {
  it("uses Offer claimed title and Got it CTA", () => {
    expect(CLAIM_OFFER_SUCCESS_TITLE).toBe("Offer claimed")
    expect(CLAIM_OFFER_SUCCESS_CTA).toBe("Got it")
  })
})
