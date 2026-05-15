import { Button, Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import ChevronDown from "@bolteu/kalep-react-icons/dist/ChevronDown"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useCallback, useId, useMemo, useRef, useState } from "react"
import { Drawer } from "vaul"
import type { ClaimData, ClaimOfferModalOffer, PaymentMethod } from "@/features/offers/offers.types"
import type {
  GetTimePickerConfigOptions,
  OfferTimeConfig,
} from "@/features/offers/utils/offerTimePicker"
import { getTimePickerConfig } from "@/features/offers/utils/offerTimePicker"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import { VAUL_SHEET_OVERLAY_CLASS } from "@/shared/utils/vaulAppSheetShell"
import { GuestPickerSheet } from "./GuestPickerSheet"
import { PaymentSelector } from "./PaymentSelector"
import { TimeSlotSheet } from "./TimeSlotSheet"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface ClaimOfferModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  offer: ClaimOfferModalOffer
  onClose: () => void
  onClaimed: (claimData: ClaimData) => void
  container?: HTMLElement | null
}

function toOfferTimeConfig(o: ClaimOfferModalOffer): OfferTimeConfig {
  return {
    isAllDay: o.isAllDay,
    offerStart: o.offerStart,
    offerEnd: o.offerEnd,
    workingHoursStart: o.workingHoursStart,
    workingHoursEnd: o.workingHoursEnd,
  }
}

function claimModalVenueScheduleLine(o: ClaimOfferModalOffer): string {
  const time =
    o.isAllDay ?
      `${o.workingHoursStart}–${o.workingHoursEnd}`
    : `${o.offerStart}–${o.offerEnd}`
  return `${o.restaurantName} · ${o.date}, ${time}`
}

/**
 * Claim sheet (vaul drawer): same shell as {@link RestaurantOfferClaimInfoSheet}
 * (inset from `--modal-top-gap`, 16px top radius, footer pinned to sheet bottom) — **no** hero image.
 * Recalculates slot lists with `new Date()` whenever the time picker opens.
 */
export function ClaimOfferModal({
  isOpen,
  onOpenChange,
  offer,
  onClose,
  onClaimed,
  container,
}: ClaimOfferModalProps) {
  const titleId = useId()
  const snackbar = useSnackbar()
  const timeCfgBase = useMemo(() => toOfferTimeConfig(offer), [offer])
  const schedulePickerOpts = useMemo((): GetTimePickerConfigOptions | undefined => {
    if (offer.offerScheduleDate == null) return undefined
    return { offerScheduleDate: offer.offerScheduleDate }
  }, [offer.offerScheduleDate])
  const timeInputRef = useRef<HTMLInputElement>(null)

  const [arrivalTime, setArrivalTime] = useState(() =>
    getTimePickerConfig(timeCfgBase, new Date(), schedulePickerOpts).initialValue,
  )
  const [guestCount, setGuestCount] = useState(2)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("dineout")
  const [guestSheetOpen, setGuestSheetOpen] = useState(false)
  const [timeSheetOpen, setTimeSheetOpen] = useState(false)
  const [slotList, setSlotList] = useState<string[]>([])
  /**
   * Vaul + Radix only run the internal `onOpenChange(true)` path (and set `hasBeenOpened`)
   * when `open` transitions to true. Mounting with `open` already true can leave the drawer
   * visually closed. Start false, then flip in layout to avoid a flash before paint.
   */
  const [drawerOpen, setDrawerOpen] = useState(false)
  if (isOpen && !drawerOpen) {
    setDrawerOpen(true)
  } else if (!isOpen && drawerOpen) {
    setDrawerOpen(false)
  }

  const handleArrivalRowPress = useCallback(() => {
    const cfg = getTimePickerConfig(timeCfgBase, new Date(), schedulePickerOpts)
    if (cfg.mode === "slots") {
      if (!cfg.slots?.length) {
        onClose()
        return
      }
      setSlotList(cfg.slots)
      const next =
        cfg.slots.includes(arrivalTime) ?
          arrivalTime
        : (cfg.slots[0] ?? cfg.initialValue)
      setArrivalTime(next)
      setTimeSheetOpen(true)
      return
    }
    const el = timeInputRef.current
    if (!el) return
    try {
      el.showPicker?.()
    } catch {
      el.click()
    }
  }, [arrivalTime, timeCfgBase, schedulePickerOpts, onClose])

  const handleClaim = useCallback(() => {
    const cfg = getTimePickerConfig(timeCfgBase, new Date(), schedulePickerOpts)
    if (cfg.mode === "slots" && (!cfg.slots || cfg.slots.length === 0)) {
      snackbar.add({
        description: "This offer is no longer available.",
        timeout: 4000,
      })
      return
    }
    onClaimed({
      arrivalTime,
      guestCount,
      paymentMethod,
    })
  }, [
    arrivalTime,
    guestCount,
    paymentMethod,
    onClaimed,
    snackbar,
    timeCfgBase,
    schedulePickerOpts,
  ])

  const nativeCfg = getTimePickerConfig(
    timeCfgBase,
    new Date(),
    schedulePickerOpts,
  )

  return (
    <Drawer.Root
      open={drawerOpen}
      onOpenChange={(open) => {
        setDrawerOpen(open)
        if (!open) {
          onOpenChange(false)
          onClose()
        }
      }}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={container ?? undefined}
    >
      <Drawer.Portal>
          <Drawer.Overlay
            className={VAUL_SHEET_OVERLAY_CLASS}
            style={{ zIndex: Z_CLAIM_MODAL_OVERLAY }}
          />
          <Drawer.Content
            className={[
              // Match {@link RestaurantOfferClaimInfoSheet} shell (inset + radius);
              // `--app-h` keeps height correct inside `DeviceShellOutlet` (not raw `100dvh`).
              "fixed bottom-0 left-0 right-0 top-[var(--modal-top-gap)] flex max-h-[calc(var(--app-h)-var(--modal-top-gap))] min-h-0 flex-col overflow-hidden outline-none",
              "rounded-t-[16px] bg-layer-floor-1",
              "shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
            ].join(" ")}
            style={{ zIndex: Z_CLAIM_MODAL_CONTENT }}
          >
            <Drawer.Title className="sr-only">
              {offer.title} — {offer.restaurantName}
            </Drawer.Title>
            <Drawer.Close asChild>
              <button
                type="button"
                className={`${SHEET_CLOSE_ON_SURFACE_CLASS} !right-3 !top-3 !size-7`}
                aria-label="Close"
              >
                <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
              </button>
            </Drawer.Close>

            <div
              className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain"
            >
              <Drawer.Description className="sr-only">
                Claim {offer.title} at {offer.restaurantName}.
              </Drawer.Description>

              <div className="flex flex-col gap-2 bg-layer-floor-1 px-6 pb-3 pt-10 pe-14">
                <h1 id={titleId} className="m-0 p-0">
                  <Typography
                    variant="heading-m-accent"
                    color="primary"
                    as="span"
                    inlineStyle={SEMIBOLD}
                  >
                    {offer.title}
                  </Typography>
                </h1>
                <Typography
                  variant="body-m-regular"
                  color="secondary"
                  as="p"
                >
                  {claimModalVenueScheduleLine(offer)}
                </Typography>
              </div>

              <input
                ref={timeInputRef}
                type="time"
                className="pointer-events-none fixed left-0 top-0 size-0 opacity-0"
                tabIndex={-1}
                aria-hidden
                step={60}
                min={
                  nativeCfg.mode === "native" ? nativeCfg.minTime : undefined
                }
                max={
                  nativeCfg.mode === "native" ? nativeCfg.maxTime : undefined
                }
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />

              <div className="flex flex-col">
                <button
                  type="button"
                  className="flex w-full flex-row items-center justify-between gap-3 border-0 border-b border-separator bg-transparent px-6 pb-[13px] pt-[14px] text-left transition-colors hover:bg-active-neutral-secondary active:bg-active-neutral-secondary"
                  onClick={handleArrivalRowPress}
                >
                  <Typography as="span" variant="body-m-regular" color="primary">
                    When will you arrive?
                  </Typography>
                  <span className="flex min-w-0 shrink-0 items-center gap-1 rounded-lg bg-neutral-secondary px-3 py-2">
                    <Typography
                      as="span"
                      variant="body-m-accent"
                      color="primary"
                      inlineStyle={SEMIBOLD}
                      noWrap
                    >
                      {arrivalTime}
                    </Typography>
                    <ChevronDown size="sm" className="shrink-0 text-tertiary" aria-hidden />
                  </span>
                </button>

                <button
                  type="button"
                  className="flex w-full flex-row items-center justify-between gap-3 border-0 border-b border-separator bg-transparent px-6 pb-[13px] pt-[14px] text-left transition-colors hover:bg-active-neutral-secondary active:bg-active-neutral-secondary"
                  onClick={() => setGuestSheetOpen(true)}
                >
                  <Typography as="span" variant="body-m-regular" color="primary">
                    How many guests?
                  </Typography>
                  <span className="flex min-w-0 shrink-0 items-center gap-1 rounded-lg bg-neutral-secondary px-3 py-2">
                    <Typography
                      as="span"
                      variant="body-m-accent"
                      color="primary"
                      inlineStyle={SEMIBOLD}
                      noWrap
                    >
                      {guestCount === 1 ? "1 guest" : `${guestCount} guests`}
                    </Typography>
                    <ChevronDown size="sm" className="shrink-0 text-tertiary" aria-hidden />
                  </span>
                </button>
              </div>

              <PaymentSelector
                value={paymentMethod}
                onChange={setPaymentMethod}
              />

              <div className="flex flex-col gap-3 px-6 pb-8 pt-0">
                <Typography variant="body-s-regular" color="secondary" as="p">
                  Offers may exclude some items. Bolt Food offers can&apos;t be
                  combined with other offers at the venue and don&apos;t apply to
                  delivery or pickup orders.
                </Typography>
                <Typography variant="body-s-regular" color="secondary" as="p">
                  Venues may add a service charge and other{" "}
                  <button
                    type="button"
                    className="inline border-none bg-transparent p-0 align-baseline text-action-primary underline underline-offset-2 transition-opacity hover:opacity-90 active:opacity-80"
                    onClick={() => {
                      snackbar.add({
                        description:
                          "Terms and conditions will be available in a future release.",
                        timeout: 4000,
                      })
                    }}
                  >
                    <Typography
                      as="span"
                      variant="body-s-regular"
                      color="action-primary"
                    >
                      Terms and Conditions
                    </Typography>
                  </button>{" "}
                  may apply.
                </Typography>
              </div>
            </div>

            <div
              data-snackbar-anchor=""
              className="shrink-0 bg-layer-floor-1 px-6 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3"
            >
              <Button
                type="button"
                variant="primary"
                fullWidth
                onClick={handleClaim}
              >
                Claim offer
              </Button>
            </div>
          </Drawer.Content>
      </Drawer.Portal>

      <TimeSlotSheet
        isOpen={timeSheetOpen}
        onOpenChange={setTimeSheetOpen}
        slots={slotList}
        value={arrivalTime}
        onChange={setArrivalTime}
        container={container}
      />
      <GuestPickerSheet
        isOpen={guestSheetOpen}
        onOpenChange={setGuestSheetOpen}
        value={guestCount}
        onChange={setGuestCount}
        container={container}
      />
    </Drawer.Root>
  )
}
