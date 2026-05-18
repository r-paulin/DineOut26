import { describe, expect, it } from "vitest"
import { getClaimOfferButtonSubtitle } from "@/features/offers/components/ClaimOfferModal/useClaimOfferButtonSubtitle"

describe("getClaimOfferButtonSubtitle", () => {
  it("returns stacked percents for DineOut", () => {
    expect(getClaimOfferButtonSubtitle("dineout", 20, 40)).toEqual({
      mode: "stacked",
      basePercent: 20,
      addPercent: 40,
    })
  })

  it("returns single base percent for card or cash", () => {
    expect(getClaimOfferButtonSubtitle("card_or_cash", 30)).toEqual({
      mode: "single",
      label: "30%",
    })
  })
})
