import { Button, Typography } from "@bolteu/kalep-react"
import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import CheckFlower from "@bolteu/kalep-react-icons/dist/CheckFlower"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import { useEffect, useId, type ReactElement } from "react"
import { Drawer } from "vaul"
import { CLAIM_PROMO_HERO_SRC } from "@/features/offers/constants/claimFlowHero"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { markWalkInOfferInfoSeenThisSession } from "@/features/restaurant/utils/walkInOfferInfoSession"
import {
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
  SHEET_CLOSE_OVER_MEDIA_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

const LIST_ICONS: ReactElement[] = [
  <Calendar key="cal" size="lg" aria-hidden />,
  <Food key="food" size="lg" aria-hidden />,
  <CheckFlower key="cf" size="lg" aria-hidden />,
]

const ROWS = [
  {
    title: "Flexible walk-in offer",
    subtitle:
      "A walk-in offer allows you to dine-out without needing a booking. Venues create these offers when they have space tables to fill. If the venue is busy, you may have to wait to get seated.",
  },
  {
    title: "Food only discount",
    subtitle:
      "The discount applies to food items only. Drinks and set menus are excluded.",
  },
  {
    title: "One offer per visit",
    subtitle: "Only one offer can be redeemed at a time per visit.",
  },
] as const

export interface RestaurantOfferClaimInfoSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Portal target (device shell); falls back to default when absent. */
  container?: HTMLElement | null
  /** Fires when the user taps **Continue** (after the info sheet is shown). */
  onContinue?: () => void
}

/**
 * Bottom sheet when the user taps an available (unclaimed) offer banner.
 * Figma: MODAL / Claiming offer - Info (`15750:40007`).
 * Content-sized shell (h-fit) — same family as {@link AtVenueNoClaimedOffersSheet}.
 * **Continue** opens the claim modal (see {@link HomeScreen}).
 */
export function RestaurantOfferClaimInfoSheet({
  isOpen,
  onOpenChange,
  container,
  onContinue,
}: RestaurantOfferClaimInfoSheetProps) {
  const titleId = useId()

  useEffect(() => {
    if (isOpen) markWalkInOfferInfoSeenThisSession()
  }, [isOpen])

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
        >
          <Drawer.Title className="sr-only">
            Bolt DineOut walk-in offers
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
          <div className="flex max-h-[97vh] flex-col overflow-y-auto overscroll-y-contain">
            <Drawer.Description className="sr-only">
              Information about Bolt DineOut walk-in offers before you claim.
            </Drawer.Description>

            <div className="relative aspect-[375/250] w-full shrink-0 overflow-hidden bg-special-brand-alt">
              <img
                src={CLAIM_PROMO_HERO_SRC}
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
                  Bolt DineOut walk-in offers
                </Typography>
              </h2>
              <Typography variant="body-m-regular" color="secondary" as="p">
                Before you move on, please note the following
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

            <div className="shrink-0 bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-4">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onContinue?.()
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
