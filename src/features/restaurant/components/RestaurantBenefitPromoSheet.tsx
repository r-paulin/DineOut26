import { Button, Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import PercentCircle from "@bolteu/kalep-react-icons/dist/PercentCircle"
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

export type RestaurantBenefitPromoVariant = "dineout40" | "visa10"

export interface RestaurantBenefitPromoSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  variant: RestaurantBenefitPromoVariant
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
}

const LIST_ICONS: ReactElement[] = [
  <MobilePayment key="mp" size="lg" aria-hidden />,
  <PercentCircle key="pc" size="lg" aria-hidden />,
  <Receipt key="rc" size="lg" aria-hidden />,
  <CheckCircle key="cc" size="lg" aria-hidden />,
]

const DINEOUT40_COPY = {
  title: "40% off your first 2 orders",
  intro:
    "Extra savings that apply automatically when you pay with Bolt DineOut.",
  rows: [
    {
      title: "Pay your bill through the app",
      subtitle:
        "Your 40% discount is applied automatically when you pay in the app. No code or validation needed.",
    },
    {
      title: "Stacks with other offers",
      subtitle:
        "Combine this discount with other eligible DineOut offers you've claimed.",
    },
    {
      title: "Applied to the restaurant's bill",
      subtitle:
        "The discount is calculated on the total bill provided by the restaurant.",
    },
    {
      title: "No claiming required",
      subtitle: "Simply pay in the app to use your discount",
    },
  ],
} as const

const VISA10_COPY = {
  title: "Get 10€ off when you pay with Visa",
  intro:
    "Use a Visa card when paying in the Bolt DineOut and get 10€ off your restaurant bill.",
  rows: [
    {
      title: "Pay your bill through the app",
      subtitle: "Select Visa as your payment method when settling the bill.",
    },
    {
      title: "Stacks with other offers",
      subtitle:
        "Combine this discount with other eligible DineOut offers you've claimed.",
    },
    {
      title: "Applied to the restaurant's bill",
      subtitle: "The 10€ discount is deducted from your total before payment.",
    },
    {
      title: "No claiming required",
      subtitle: "Just pay with Visa — no code needed.",
    },
  ],
} as const

/**
 * Bottom sheet: DineOut 40% or Visa 10€ benefit promos from “More benefits”.
 * Figma: MODAL / DineOut Promo (`15876:20051`), MODAL / Partner Promo (`15877:20153`).
 * Shell matches {@link RestaurantOpenHoursSheet} / {@link RestaurantRatingSheet}.
 * The 40% hero uses `Modal-2.png`; Visa uses `Modal-3.png` from `public/images/modal-img/`.
 */
export function RestaurantBenefitPromoSheet({
  isOpen,
  onOpenChange,
  variant,
  container,
}: RestaurantBenefitPromoSheetProps) {
  const titleId = useId()
  const copy = variant === "dineout40" ? DINEOUT40_COPY : VISA10_COPY

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
          <Drawer.Title className="sr-only">
            {copy.title}
          </Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_OVER_MEDIA_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_OVER_MEDIA_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
          >
            <Drawer.Description className="sr-only">
              {variant === "dineout40"
                ? "Details about the DineOut first orders discount."
                : "Details about the Visa payment discount."}
            </Drawer.Description>

            <div className="relative aspect-[375/250] w-full shrink-0 overflow-hidden bg-special-brand-alt">
              <img
                src={
                  variant === "dineout40"
                    ? modalImageUrl("Modal-2.png")
                    : modalImageUrl("Modal-3.png")
                }
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
                  {copy.title}
                </Typography>
              </h2>
              <Typography variant="body-m-regular" color="secondary" as="p">
                {copy.intro}
              </Typography>
              <ul className="m-0 mt-2 flex list-none flex-col p-0">
                {copy.rows.map((row, i) => (
                  <li
                    key={`${variant}-${i}`}
                    className={[
                      "border-b border-separator py-[10px] last:border-b-0",
                    ].join(" ")}
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
              onClick={() => onOpenChange(false)}
            >
              Got it
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
