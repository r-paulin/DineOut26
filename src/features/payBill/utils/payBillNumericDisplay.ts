import type { CSSProperties } from "react"

/**
 * Figma Pay hero — lining + proportional figures, Inter cv03/cv04 for EUR strings.
 */
export const payBillNumericOpentype: CSSProperties = {
  fontFamily: 'var(--font-family, "Inter Variable")',
  fontVariantNumeric: "lining-nums proportional-nums",
  fontFeatureSettings: "'cv03' on, 'cv04' on",
}

/** Main “You’ll pay” hero amount (64 / 72, wght 650, tight tracking). */
export const payBillHeroMainPriceStyle: CSSProperties = {
  ...payBillNumericOpentype,
  fontSize: 64,
  fontStyle: "normal",
  fontWeight: 650,
  lineHeight: "72px",
  letterSpacing: "-1.408px",
  fontVariationSettings: "'wght' 650",
}

/** Figma placeholder `0` — Body regular weight, tertiary fill applied in markup. */
export const payBillHeroPlaceholderZeroStyle: CSSProperties = {
  ...payBillNumericOpentype,
  fontSize: 64,
  fontStyle: "normal",
  fontWeight: 400,
  lineHeight: "72px",
  letterSpacing: "-1.408px",
  fontVariationSettings: "'wght' 400",
}

/** € suffix — ~65% of hero digits, 8px bottom padding, line-height 1. */
export const payBillEuroSuffixStyle: CSSProperties = {
  ...payBillNumericOpentype,
  display: "inline-block",
  fontSize: 42,
  fontStyle: "normal",
  fontWeight: 650,
  lineHeight: 1,
  letterSpacing: "-0.462px",
  fontVariationSettings: "'wght' 650",
  paddingBottom: "8px",
}

/** Saved ticket EUR — Heading XS scale + semibold (Figma). */
export const payBillSavedTicketAmountStyle: CSSProperties = {
  ...payBillNumericOpentype,
  fontSize: "var(--Heading-XS-font-size, 20px)",
  fontStyle: "normal",
  fontWeight: "var(--font-weight-semibold, 650)",
  lineHeight: "var(--Heading-XS-line-height, 25px)",
  letterSpacing: "-0.34px",
  fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
}

/** Pay footer “Total” row — Heading XS accent + content primary (Figma). */
export const payBillFooterTotalRowTextStyle: CSSProperties = {
  ...payBillNumericOpentype,
  color: "var(--content-primary, #191F1C)",
  fontSize: "var(--Heading-XS-font-size, 20px)",
  fontStyle: "normal",
  fontWeight: "var(--font-weight-semibold, 650)",
  lineHeight: "var(--Heading-XS-line-height, 25px)",
  letterSpacing: "-0.34px",
  fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
}
