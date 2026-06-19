import { describe, expect, it } from "vitest"
import {
  CUSTOM_TIP_HEADING,
  formatTipScreenBillTotalLabel,
  TIP_SCREEN_CUSTOM_PILL_LABEL,
  TIP_SCREEN_SUBTITLE,
} from "./tipScreenCopy"

describe("tipScreenCopy", () => {
  it("uses custom tip sheet heading", () => {
    expect(CUSTOM_TIP_HEADING).toBe("Enter a custom tip")
  })

  it("uses Custom pill label on the tip screen", () => {
    expect(TIP_SCREEN_CUSTOM_PILL_LABEL).toBe("Custom")
  })

  it("uses no-deduction subtitle on the tip screen", () => {
    expect(TIP_SCREEN_SUBTITLE).toBe("We don't deduct anything from tips")
  })

  it("formats bill total label with EUR amount", () => {
    expect(formatTipScreenBillTotalLabel(12)).toBe("Bill total: 12,00 €")
    expect(formatTipScreenBillTotalLabel(12.5)).toBe("Bill total: 12,50 €")
  })
})
