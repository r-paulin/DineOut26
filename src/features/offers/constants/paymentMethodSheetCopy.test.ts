import { describe, expect, it } from "vitest"
import { formatDineOutClaimCashbackBannerHeadline } from "@/features/offers/constants/dineOutStackablePromo"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import {
  CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL,
  CLAIM_PAYMENT_SECTION_INTRO,
  CLAIM_PAYMENT_SECTION_TITLE,
  CLAIM_PAYMENT_VENUE_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
  formatPaymentMethodDineoutDetail,
  getClaimPaymentOptionDetail,
  getPaymentMethodOptionDetail,
  PAYMENT_METHOD_SHEET_CONFIRM_CTA,
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "./paymentMethodSheetCopy"

describe("paymentMethodSheetCopy", () => {
  it("uses claimed-offer payment sheet title and intro", () => {
    expect(PAYMENT_METHOD_SHEET_TITLE).toBe("Choose how to pay")
    expect(PAYMENT_METHOD_SHEET_INTRO).toBe("You won't be charged yet")
    expect(PAYMENT_METHOD_SHEET_CONFIRM_CTA).toBe("Confirm")
  })

  it("uses claim-modal payment section copy", () => {
    expect(CLAIM_PAYMENT_SECTION_TITLE).toBe("How will you pay?")
    expect(CLAIM_PAYMENT_SECTION_INTRO).toBe(
      "Select how you'll pay the bill after dining",
    )
    expect(PAYMENT_METHOD_DINEOUT_OPTION_LABEL).toBe("Pay with Bolt Food")
    expect(CLAIM_PAYMENT_VENUE_OPTION_LABEL).toBe("Pay by card or cash")
  })

  it("formats DineOut detail for claimed-offer payment sheet", () => {
    expect(formatPaymentMethodDineoutDetail()).toBe(
      `Earn ${formatDiscountPercent(DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT)}% back as Bolt Balance`,
    )
  })

  it("getPaymentMethodOptionDetail returns dineout detail only", () => {
    expect(getPaymentMethodOptionDetail("dineout")).toBe(
      formatPaymentMethodDineoutDetail(),
    )
    expect(getPaymentMethodOptionDetail("card_or_cash")).toBeUndefined()
  })

  it("formats cashback banner headline copy", () => {
    expect(formatDineOutClaimCashbackBannerHeadline()).toBe(
      `Get ${formatDiscountPercent(DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT)}% cashback on your total bill when you pay in the app`,
    )
  })

  it("getClaimPaymentOptionDetail returns claim-modal inline detail", () => {
    expect(getClaimPaymentOptionDetail("dineout")).toBe(
      formatDineOutClaimCashbackBannerHeadline(),
    )
    expect(getClaimPaymentOptionDetail("card_or_cash")).toBe(
      CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL,
    )
  })
})
