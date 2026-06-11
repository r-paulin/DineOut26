import { describe, expect, it } from "vitest"
import {
  CLAIMED_OFFER_CHECK_IN_CTA,
  CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION,
  CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE,
  CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD,
  CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL,
  CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN,
  CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN,
  CLAIMED_OFFER_HOW_IT_WORKS_LABEL,
  CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE,
  CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE,
  CLAIMED_OFFER_IVE_PAID_LABEL,
  CLAIMED_OFFER_PAYMENT_CHANGE_LABEL,
  CLAIMED_OFFER_PAYMENT_ROW_DINEOUT,
  CLAIMED_OFFER_PAYMENT_ROW_VENUE,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_LEAD,
  CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_TAIL,
  CLAIMED_OFFER_PIN_LABEL,
  VENUE_PAYMENT_CONFIRM_BODY,
  VENUE_PAYMENT_CONFIRM_PRIMARY_CTA,
  VENUE_PAYMENT_CONFIRM_SECONDARY_CTA,
  VENUE_PAYMENT_CONFIRM_TITLE,
} from "./claimedOfferCopy"

describe("claimedOfferCopy (Figma 17459)", () => {
  it("uses check-in hero subtitles", () => {
    expect(CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN).toBe(
      "Check in and let the staff know you're using DineOut. Order and enjoy your meal as usual.",
    )
    expect(CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN).toBe(
      "Check in and let the staff know you're using DineOut. Order and enjoy your meal as usual.",
    )
    expect(CLAIMED_OFFER_HERO_SUBTITLE_CHECKED_IN).toBe(
      CLAIMED_OFFER_HERO_SUBTITLE_NOT_CHECKED_IN,
    )
  })

  it("uses check-in footer copy aligned with at-venue bar", () => {
    expect(CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_LEAD).toBe("At the venue?")
    expect(CLAIMED_OFFER_CHECK_IN_FOOTER_PROMO_TAIL).toBe(
      "Check in to reveal your offer PIN",
    )
    expect(CLAIMED_OFFER_CHECK_IN_CTA).toBe("Check in")
  })

  it("uses check-in success snackbar copy (Figma 17504)", () => {
    expect(CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE).toBe("You're checked in")
    expect(CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION).toBe(
      "Show your PIN to the staff and enjoy your meal as usual",
    )
  })

  it("uses pay footers after check-in", () => {
    expect(CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_LEAD).toBe("Got your bill?")
    expect(CLAIMED_OFFER_PAY_FOOTER_PROMO_DINEOUT_TAIL).toBe(
      "Pay and claim your cashback",
    )
    expect(CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_LEAD).toBe("Paid the bill?")
    expect(CLAIMED_OFFER_PAY_FOOTER_PROMO_VENUE_TAIL).toBe(
      "Let us know to continue",
    )
    expect(CLAIMED_OFFER_IVE_PAID_LABEL).toBe("I've paid")
  })

  it("uses detail row payment labels and Change action", () => {
    expect(CLAIMED_OFFER_PAYMENT_ROW_DINEOUT).toBe("Pay with Bolt Food")
    expect(CLAIMED_OFFER_PAYMENT_ROW_VENUE).toBe("Pay by card or cash")
    expect(CLAIMED_OFFER_PAYMENT_CHANGE_LABEL).toBe("Change")
  })

  it("keeps PIN banner label", () => {
    expect(CLAIMED_OFFER_PIN_LABEL).toBe(
      "Show this PIN to the waiter when you arrive",
    )
  })

  it("includes how-it-works ghost link label", () => {
    expect(CLAIMED_OFFER_HOW_IT_WORKS_LABEL).toBe("How your offer works")
  })

  it("uses how-it-works sheet copy on claimed-offer hero", () => {
    expect(CLAIMED_OFFER_HOW_IT_WORKS_SHEET_TITLE).toBe("How it works")
    expect(CLAIMED_OFFER_HOW_IT_WORKS_SHEET_SUBTITLE).toBe(
      "When you arrive at the venue, here's how you can use your offer",
    )
  })

  it("uses venue payment confirmation alert copy (Figma 17475)", () => {
    expect(VENUE_PAYMENT_CONFIRM_TITLE).toBe("Pay by card or cash?")
    expect(VENUE_PAYMENT_CONFIRM_BODY).toBe(
      "You won't earn Bolt Balance if you pay by card or cash",
    )
    expect(VENUE_PAYMENT_CONFIRM_PRIMARY_CTA).toBe("Pay by card or cash")
    expect(VENUE_PAYMENT_CONFIRM_SECONDARY_CTA).toBe("Pay with Bolt Food")
  })
})
