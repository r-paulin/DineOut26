import { describe, expect, it } from "vitest"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import {
  formatClaimModalDisclaimerValidityLine,
  formatClaimModalOfferAvailability,
  formatClaimModalOfferDetailRows,
} from "@/features/offers/utils/formatClaimModalOfferDetailRows"

const baseOffer: ClaimOfferModalOffer = {
  id: "o1",
  title: "Claim 20% off your bill",
  restaurantName: "Neiburgs",
  discountPercent: 20,
  date: "Today",
  offerStart: "19:00",
  offerEnd: "23:00",
  isAllDay: false,
  workingHoursStart: "12:00",
  workingHoursEnd: "23:00",
  timeWindow: "19:00 - 23:00",
  minOrderEur: 10,
}

describe("formatClaimModalOfferDetailRows", () => {
  it("returns minimum order, applicable, and available rows in Figma order", () => {
    const rows = formatClaimModalOfferDetailRows(baseOffer)
    expect(rows).toEqual([
      { label: "Minimum order", value: "10,00 €" },
      { label: "Applicable", value: "Total bill" },
      { label: "Available", value: "Today · 19:00–23:00" },
    ])
  })
})

describe("formatClaimModalOfferAvailability", () => {
  it("strips Arrive between prefix and uses middle dot + en-dash", () => {
    expect(
      formatClaimModalOfferAvailability("17 May", "Arrive between 15:00 - 16:00"),
    ).toBe("17 May · 15:00–16:00")
  })

  it("converts hyphen in plain time windows to en-dash", () => {
    expect(formatClaimModalOfferAvailability("Today", "19:00 - 23:00")).toBe(
      "Today · 19:00–23:00",
    )
  })

  it("passes through already-formatted time without extra changes", () => {
    expect(formatClaimModalOfferAvailability("Today", "All day")).toBe("Today · All day")
  })
})

describe("formatClaimModalDisclaimerValidityLine", () => {
  it("formats Figma disclaimer lead with Valid on … from …", () => {
    expect(
      formatClaimModalDisclaimerValidityLine(
        "17 May",
        "Arrive between 15:00 - 16:00",
      ),
    ).toBe("Offer applies to the total bill. Valid on 17 May from 15:00–16:00.")
  })
})
