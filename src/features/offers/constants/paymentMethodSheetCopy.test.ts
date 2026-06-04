import { describe, expect, it } from "vitest"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import {
  formatPaymentMethodDineoutDetail,
  getPaymentMethodOptionDetail,
  PAYMENT_METHOD_CARD_CASH_DETAIL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE,
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "./paymentMethodSheetCopy"

describe("paymentMethodSheetCopy", () => {
  it("uses Figma title and intro", () => {
    expect(PAYMENT_METHOD_SHEET_TITLE).toBe("Payment method")
    expect(PAYMENT_METHOD_SHEET_INTRO).toBe(
      "Pay at the venue after dining. Choose your preferred payment method.",
    )
  })

  it("uses Bolt Food app payment option labels", () => {
    expect(PAYMENT_METHOD_DINEOUT_OPTION_LABEL).toBe("Pay via Bolt Food app")
    expect(PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE).toBe(
      "Paying via Bolt Food app",
    )
  })

  it("formats DineOut detail with default percent", () => {
    expect(formatPaymentMethodDineoutDetail()).toBe(
      `Pay via app and get ${DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT}% back in Bolt Balance after payment`,
    )
  })

  it("uses static card/cash detail", () => {
    expect(PAYMENT_METHOD_CARD_CASH_DETAIL).toBe(
      "Pay directly at the venue. No cashback will be applied.",
    )
  })

  it("getPaymentMethodOptionDetail returns detail for selected method only", () => {
    expect(getPaymentMethodOptionDetail("dineout")).toContain("15%")
    expect(getPaymentMethodOptionDetail("card_or_cash")).toBe(
      PAYMENT_METHOD_CARD_CASH_DETAIL,
    )
  })
})
