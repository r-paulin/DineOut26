import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import { useEffect, useId, useRef, type AnimationEvent, type ReactElement } from "react"
import { Drawer } from "vaul"
import { DEFAULT_DINEOUT_PAY_BENEFIT_PERCENT } from "@/features/payBill/constants"
import { formatDiscountPercent } from "@/features/payBill/utils/formatDiscountPercent"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { modalImageUrl } from "@/shared/utils/publicImageUrls"
import {
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
  SHEET_CLOSE_OVER_MEDIA_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

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
 * Content-sized shell (h-fit) — same family as {@link RestaurantReportProblemSheet}.
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
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={VAUL_SHEET_OVERLAY_CLASS}
          style={{ zIndex: Z_RESTAURANT_SHEET_OVERLAY }}
        />
        <Drawer.Content
          className={vaulSheetContentClassName()}
          style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
          onAnimationEnd={handleContentAnimationEnd}
        >
          <Drawer.Title className="sr-only">{welcomeTitle}</Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_OVER_MEDIA_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_OVER_MEDIA_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div className="flex max-h-[97vh] flex-col overflow-y-auto overscroll-y-contain">
            <Drawer.Description className="sr-only">
              How to dine and pay with Bolt DineOut at {restaurantName}.
            </Drawer.Description>

            <div className="relative aspect-[375/250] w-full shrink-0 overflow-hidden bg-special-brand-alt">
              <img
                src={HERO_SRC}
                alt=""
                width={393}
                height={262}
                decoding="async"
                draggable={false}
                className="absolute inset-0 size-full object-cover"
              />
            </div>

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
                        <Typography
                          as="span"
                          variant="body-m-accent"
                          color="primary"
                        >
                          {row.title}
                        </Typography>
                        <Typography
                          as="span"
                          variant="body-s-regular"
                          color="secondary"
                        >
                          {row.subtitle}
                        </Typography>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-4">
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
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
