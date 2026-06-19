import { Typography } from "@bolteu/kalep-react"
import { claimedOfferLayout } from "@/features/offers/components/ClaimedOfferPage/claimedOfferLayout"
import { parseClaimPinForDisplay } from "@/features/offers/components/ClaimedOfferPage/parseClaimPinForDisplay"
import { PAY_CONFIRM_PAYMENT_CODE_LABEL } from "@/features/payBill/constants/paymentConfirmationCopy"

const PIN_FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const PIN_DIGIT_STYLE = {
  fontFeatureSettings: PIN_FONT_FEAT,
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  color: "var(--color-static-content-key-light)",
} as const

const PIN_LABEL_STYLE = {
  color: "var(--color-static-content-key-light)",
  fontFeatureSettings: PIN_FONT_FEAT,
} as const

export interface PaymentConfirmationPinBannerProps {
  paymentCode: string
}

/** Figma `17694:148939` — green payment code banner with digit slots. */
export function PaymentConfirmationPinBanner({
  paymentCode,
}: PaymentConfirmationPinBannerProps) {
  const pinResult = parseClaimPinForDisplay(paymentCode)

  return (
    <div className={claimedOfferLayout.pinBannerInner}>
      <div className={claimedOfferLayout.pinBannerLabel}>
        <Typography
          variant="body-s-regular"
          as="p"
          inlineStyle={PIN_LABEL_STYLE}
        >
          {PAY_CONFIRM_PAYMENT_CODE_LABEL}
        </Typography>
      </div>
      {pinResult.ok ?
        <div
          className={claimedOfferLayout.pinDigitsRow}
          role="group"
          aria-label={`Payment code ${pinResult.digits.join(" ")}`}
        >
          {pinResult.digits.map((digit, index) => (
            <div
              key={`${index}-${digit}`}
              className={claimedOfferLayout.pinDigit}
            >
              <Typography
                variant="heading-s-accent"
                as="span"
                align="center"
                inlineStyle={PIN_DIGIT_STYLE}
              >
                {digit}
              </Typography>
            </div>
          ))}
        </div>
      : <Typography variant="body-s-regular" as="p" inlineStyle={PIN_LABEL_STYLE}>
          {pinResult.message}
        </Typography>
      }
    </div>
  )
}
