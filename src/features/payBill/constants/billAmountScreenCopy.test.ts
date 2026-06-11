import { describe, expect, it } from "vitest"
import {
  BILL_AMOUNT_SUBTITLE_DEFAULT,
  BILL_AMOUNT_TITLE,
  formatBillAmountSubtitleClaimed,
} from "./billAmountScreenCopy"

describe("billAmountScreenCopy", () => {
  it("uses enter bill total as the screen title", () => {
    expect(BILL_AMOUNT_TITLE).toBe("Enter bill total")
  })

  it("formats claimed-offer subtitle with discount percent", () => {
    expect(formatBillAmountSubtitleClaimed(20)).toBe(
      "Check that your 20% discount is shown on the receipt, then enter the final bill amount.",
    )
  })

  it("uses default subtitle when no claimed offer", () => {
    expect(BILL_AMOUNT_SUBTITLE_DEFAULT).toBe(
      "Enter the final amount from your receipt.",
    )
  })
})
