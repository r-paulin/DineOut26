import { Button, Typography } from "@bolteu/kalep-react"
import ArrowCircleRight from "@bolteu/kalep-react-icons/dist/ArrowCircleRight"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import Payment from "@bolteu/kalep-react-icons/dist/Payment"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import { useId, type ReactElement } from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { modalImageUrl } from "@/shared/utils/publicImageUrls"
import {
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
  SHEET_CLOSE_OVER_MEDIA_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"

const HERO_SRC = modalImageUrl("Modal-1.png")

const LIST_ICONS: ReactElement[] = [
  <Receipt key="receipt" size="lg" aria-hidden />,
  <ArrowCircleRight key="arrow" size="lg" aria-hidden />,
  <Payment key="payment" size="lg" aria-hidden />,
  <CheckCircle key="check" size="lg" aria-hidden />,
]

const ROWS = [
  {
    title: "Ask for the receipt",
    subtitle: "Request the final bill from the waiter",
  },
  {
    title: "Tap “Pay bill” in the app",
    subtitle: "Enter the total amount shown on your receipt",
  },
  {
    title: "Choose your payment method",
    subtitle: "Select your saved payment method in the Bolt Food app",
  },
  {
    title: "Confirm and pay",
    subtitle: "Review applied offers or rewards and complete your payment",
  },
] as const

export interface ClaimedOfferPayBillInfoSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  /** Fires when the user taps **Got it** — parent should open pay flow. */
  onContinue?: () => void
}

/**
 * Pre-pay informational bottom sheet from claimed-offer “Pay bill with DineOut”.
 * Figma: MODAL / DineOut Promo (`16025:26101`).
 * Shell matches {@link RestaurantBenefitPromoSheet}.
 */
export function ClaimedOfferPayBillInfoSheet({
  isOpen,
  onOpenChange,
  container,
  onContinue,
}: ClaimedOfferPayBillInfoSheetProps) {
  const titleId = useId()

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
          className="fixed inset-0 bg-special-scrim"
          style={{ zIndex: Z_RESTAURANT_SHEET_OVERLAY }}
        />
        <Drawer.Content
          className={[
            "fixed bottom-0 left-0 right-0 top-[var(--modal-top-gap)] flex max-h-[calc(100dvh-var(--modal-top-gap))] min-h-0 flex-col overflow-hidden outline-none",
            "rounded-t-[16px] bg-layer-floor-1",
            "shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
          ].join(" ")}
          style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
        >
          <Drawer.Title className="sr-only">Pay with Bolt DineOut</Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_OVER_MEDIA_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_OVER_MEDIA_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
            <Drawer.Description className="sr-only">
              How to pay your restaurant bill with Bolt DineOut in the app.
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
                  Pay with Bolt DineOut
                </Typography>
              </h2>
              <Typography variant="body-m-regular" color="secondary" as="p">
                Settle your restaurant bill directly in the app and unlock your benefits.
              </Typography>
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
          </div>
          <div className="shrink-0 bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-4">
            <Button
              type="button"
              variant="primary"
              fullWidth
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onContinue?.()
              }}
            >
              Got it
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
