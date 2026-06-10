import { describe, expect, it } from "vitest"
import { formatDineOutClaimCashbackBannerHeadline } from "@/features/offers/constants/dineOutStackablePromo"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import {
  CLAIM_PAYMENT_CARD_CASH_INLINE_DETAIL,
  CLAIM_PAYMENT_SECTION_INTRO,
  CLAIM_PAYMENT_SECTION_TITLE,
  CLAIM_PAYMENT_VENUE_OPTION_LABEL,
  formatPaymentMethodDineoutDetail,
  getClaimPaymentOptionDetail,
  getPaymentMethodOptionDetail,
  PAYMENT_METHOD_CARD_CASH_DETAIL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL,
  PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE,
  PAYMENT_METHOD_SHEET_INTRO,
  PAYMENT_METHOD_SHEET_TITLE,
} from "./paymentMethodSheetCopy"

describe("paymentMethodSheetCopy", () => {
  it("uses edit-sheet title and intro", () => {
    expect(PAYMENT_METHOD_SHEET_TITLE).toBe("Payment method")
    expect(PAYMENT_METHOD_SHEET_INTRO).toBe(
      "Pay at the venue after dining. Choose your preferred payment method.",
    )
  })

  it("uses claim-modal payment section copy", () => {
    expect(CLAIM_PAYMENT_SECTION_TITLE).toBe("How will you pay?")
    expect(CLAIM_PAYMENT_SECTION_INTRO).toBe(
      "Select how you'll pay the bill after dining",
    )
    expect(CLAIM_PAYMENT_VENUE_OPTION_LABEL).toBe("Pay the venue directly")
  })

  it("uses Bolt Food app payment option labels", () => {
    expect(PAYMENT_METHOD_DINEOUT_OPTION_LABEL).toBe("Pay via Bolt Food app")
    expect(PAYMENT_METHOD_DINEOUT_OPTION_LABEL_ACTIVE).toBe(
      "Paying via Bolt Food app",
    )
  })

  it("formats DineOut detail with default percent for edit sheet", () => {
    expect(formatPaymentMethodDineoutDetail()).toBe(
      `Pay via app and get ${DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT}% back in Bolt Balance after payment`,
    )
  })

  it("uses static card/cash detail for edit sheet", () => {
    expect(PAYMENT_METHOD_CARD_CASH_DETAIL).toBe(
      "Pay directly at the venue. No cashback will be applied.",
    )
  })

  it("getPaymentMethodOptionDetail returns edit-sheet detail", () => {
    expect(getPaymentMethodOptionDetail("dineout")).toContain(
      `${formatDiscountPercent(DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT)}%`,
    )
    expect(getPaymentMethodOptionDetail("card_or_cash")).toBe(
      PAYMENT_METHOD_CARD_CASH_DETAIL,
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
