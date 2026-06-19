import { describe, expect, it } from "vitest"
import {
  formatPayConfirmCashbackAccent,
  formatPayConfirmCashbackHeadline,
  PAY_CONFIRM_CASHBACK_PREFIX,
  PAY_CONFIRM_CASHBACK_SUFFIX,
} from "@/features/payBill/constants/payBillCashbackCopy"
import { PAY_CONFIRM_PAYMENT_CODE_LABEL } from "@/features/payBill/constants/paymentConfirmationCopy"

describe("paymentConfirmationCopy", () => {
  it("uses Figma payment code banner label", () => {
    expect(PAY_CONFIRM_PAYMENT_CODE_LABEL).toBe(
      "Show this payment code to the waiter",
    )
  })
})

describe("pay confirm cashback copy", () => {
  it("formats single-line Bolt Food cashback headline", () => {
    expect(formatPayConfirmCashbackAccent(4.5)).toBe("4,50 € cashback")
    expect(formatPayConfirmCashbackHeadline(4.5)).toBe(
      `${PAY_CONFIRM_CASHBACK_PREFIX}4,50 € cashback${PAY_CONFIRM_CASHBACK_SUFFIX}`,
    )
  })
})
