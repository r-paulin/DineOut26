import { describe, expect, it } from "vitest"
import {
  CLAIMED_OFFER_ARRIVED_PIN_HINT,
  CLAIMED_OFFER_ARRIVED_TITLE,
  CLAIMED_OFFER_CHECK_IN_CTA,
  CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION,
  CLAIMED_OFFER_CHECKED_IN_STEP_SUBTITLE,
  CLAIMED_OFFER_CHECKED_IN_STEP_TITLE,
  CLAIMED_OFFER_GET_DIRECTIONS_LABEL,
  CLAIMED_OFFER_HOW_TO_USE_TITLE,
  CLAIMED_OFFER_IVE_PAID_LABEL,
  CLAIMED_OFFER_PAY_BILL_CTA,
  CLAIMED_OFFER_PAY_THE_BILL_CTA,
  CLAIMED_OFFER_PAYMENT_CHANGE_LABEL,
  CLAIMED_OFFER_PAYMENT_ROW_DINEOUT,
  CLAIMED_OFFER_PAYMENT_ROW_VENUE,
  formatClaimedOfferCheckInStepTitle,
  formatClaimedOfferPayStepTitle,
  VENUE_PAYMENT_CONFIRM_BODY,
  VENUE_PAYMENT_CONFIRM_PRIMARY_CTA,
  VENUE_PAYMENT_CONFIRM_SECONDARY_CTA,
  VENUE_PAYMENT_CONFIRM_TITLE,
} from "./claimedOfferCopy"

describe("claimedOfferCopy (Figma 19867)", () => {
  it("uses Get directions and How to use section copy", () => {
    expect(CLAIMED_OFFER_GET_DIRECTIONS_LABEL).toBe("Get directions")
    expect(CLAIMED_OFFER_HOW_TO_USE_TITLE).toBe("How to use your offer")
    expect(formatClaimedOfferCheckInStepTitle(30)).toBe(
      "Check in to use your 30% discount",
    )
    expect(formatClaimedOfferPayStepTitle(15)).toBe(
      "Pay your bill and get 15% cash back",
    )
    expect(CLAIMED_OFFER_ARRIVED_TITLE).toBe("Arrived?")
    expect(CLAIMED_OFFER_ARRIVED_PIN_HINT).toBe(
      "When you arrive, show this PIN to your waiter",
    )
    expect(CLAIMED_OFFER_CHECK_IN_CTA).toBe("Check in")
    expect(CLAIMED_OFFER_PAY_THE_BILL_CTA).toBe("Pay the bill")
    expect(CLAIMED_OFFER_PAY_BILL_CTA).toBe("Pay bill")
    expect(CLAIMED_OFFER_IVE_PAID_LABEL).toBe("I've paid")
  })

  it("uses checked-in step + welcome snackbar copy (Figma 19867:38029)", () => {
    expect(CLAIMED_OFFER_CHECKED_IN_STEP_TITLE).toBe("You're checked in")
    expect(CLAIMED_OFFER_CHECKED_IN_STEP_SUBTITLE).toBe(
      "Order and enjoy your meal as usual.",
    )
    expect(CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION).toBe(
      "Dine as usual and ask for the bill when you're ready",
    )
  })

  it("uses detail row payment labels and Change action", () => {
    expect(CLAIMED_OFFER_PAYMENT_ROW_DINEOUT).toBe("Pay with Bolt Food")
    expect(CLAIMED_OFFER_PAYMENT_ROW_VENUE).toBe("Pay by card or cash")
    expect(CLAIMED_OFFER_PAYMENT_CHANGE_LABEL).toBe("Change")
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
