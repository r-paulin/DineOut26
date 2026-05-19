import { Button, Typography } from "@bolteu/kalep-react"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import { useEffect, useId, useRef, type AnimationEvent, type ReactElement } from "react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import { modalImageUrl } from "@/shared/utils/publicImageUrls"

const HERO_SRC = modalImageUrl("bg-modal.jpg")

const PAY_BILL_SUBTITLE = `${formatDiscountPercent(DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT)}% off total bill`

const LIST_ICONS: ReactElement[] = [
  <Food key="food" size="lg" aria-hidden />,
  <Receipt key="receipt" size="lg" aria-hidden />,
  <MobilePayment key="payment" size="lg" aria-hidden />,
]

const ROWS = [
  {
    title: "Dine as usual",
    subtitle:
      "Ask for the menu, choose your dishes, and enjoy your meal.",
  },
  {
    title: "Ask for the receipt",
    subtitle:
      "After your meal, request the receipt and let them know you're using Bolt DineOut.",
  },
  {
    title: "Pay bill in the app",
    subtitle:
      "Enter the total shown on your receipt, then tap Pay bill to apply your offer and complete the payment.",
  },
] as const

export interface AtVenueNoClaimedOffersSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  restaurantName: string
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  /** Parent should close the sheet; pay flow opens in {@link onAfterClose}. */
  onContinue?: () => void
  /** Fires once after the close animation when the sheet has finished dismissing. */
  onAfterClose?: () => void
}

/**
 * Pre-pay bottom sheet when the user taps “I'm at the venue” without a claimed offer.
 * Figma: MODAL / No claimed offers (`16084:49094`).
 * Scrollable hero + copy; pinned Pay bill CTA (see {@link ClaimPromoSheetShell}).
 */
export function AtVenueNoClaimedOffersSheet({
  isOpen,
  onOpenChange,
  restaurantName,
  container,
  onContinue,
  onAfterClose,
}: AtVenueNoClaimedOffersSheetProps) {
  const titleId = useId()
  const welcomeTitle = `Welcome to ${restaurantName}`
  const afterCloseFiredRef = useRef(false)

  useEffect(() => {
    if (isOpen) afterCloseFiredRef.current = false
  }, [isOpen])

  const handleContentAnimationEnd = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    if (isOpen || afterCloseFiredRef.current) return
    afterCloseFiredRef.current = true
    onAfterClose?.()
  }

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      title={welcomeTitle}
      description={`How to dine and pay with Bolt DineOut at ${restaurantName}.`}
      hero="offer-image"
      heroImageSrc={HERO_SRC}
      sheetHeight="fill"
      surfaceClass="bg-layer-floor-1"
      footerBordered={false}
      onContentAnimationEnd={handleContentAnimationEnd}
      footer={
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          aria-label={`Pay bill, ${PAY_BILL_SUBTITLE}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onContinue?.()
          }}
        >
          <span className="flex flex-col items-center gap-0">
            <Typography variant="body-l-accent" color="primary-inverted" as="span">
              Pay bill
            </Typography>
            <Typography variant="body-xs-regular" color="primary-inverted" as="span">
              {PAY_BILL_SUBTITLE}
            </Typography>
          </span>
        </Button>
      }
    >
      <div className="flex flex-col gap-2 bg-layer-floor-1 px-6 pb-4 pt-6">
        <h2 id={titleId} className="m-0 p-0">
          <Typography variant="heading-m-accent" color="primary" as="span">
            {welcomeTitle}
          </Typography>
        </h2>
        <ul className="m-0 mt-2 flex list-none flex-col p-0">
          {ROWS.map((row, i) => (
            <li
              key={row.title}
              className="border-b border-separator py-[10px] last:border-b-0"
            >
              <div className="flex gap-3">
                <span className="shrink-0 text-action-primary">
                  {LIST_ICONS[i]}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Typography as="span" variant="body-m-accent" color="primary">
                    {row.title}
                  </Typography>
                  <Typography as="span" variant="body-s-regular" color="secondary">
                    {row.subtitle}
                  </Typography>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ClaimPromoSheetShell>
  )
}
