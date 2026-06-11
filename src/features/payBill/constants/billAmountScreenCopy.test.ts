import { describe, expect, it } from "vitest"
import {
  BILL_AMOUNT_SUBTITLE_CLAIMED,
  BILL_AMOUNT_SUBTITLE_DEFAULT,
  BILL_AMOUNT_TITLE,
} from "./billAmountScreenCopy"

describe("billAmountScreenCopy", () => {
  it("uses enter bill total as the screen title", () => {
    expect(BILL_AMOUNT_TITLE).toBe("Enter bill total")
  })

  it("uses receipt-check subtitle when paying with a claimed offer", () => {
    expect(BILL_AMOUNT_SUBTITLE_CLAIMED).toBe(
      "Check your offer is shown on the receipt",
    )
  })

  it("uses default subtitle when no claimed offer", () => {
    expect(BILL_AMOUNT_SUBTITLE_DEFAULT).toBe(
      "Enter the final amount from your receipt.",
    )
  })
})
