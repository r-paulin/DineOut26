import { Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import ChevronDown from "@bolteu/kalep-react-icons/dist/ChevronDown"
import { useCallback, useMemo, useRef, useState } from "react"
import { ClaimModalDisclaimer } from "@/features/offers/components/ClaimOfferModal/ClaimModalDisclaimer"
import { ClaimModalOfferDetails } from "@/features/offers/components/ClaimOfferModal/ClaimModalOfferDetails"
import { ClaimOfferFooterActions } from "@/features/offers/components/ClaimOfferModal/ClaimOfferFooterActions"
import { formatPeopleCountLabel } from "@/features/offers/components/ClaimOfferModal/formatPeopleCountLabel"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { formatOfferDiscountTitle } from "@/features/offers/utils/formatOfferDiscountTitle"
import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
  PaymentMethod,
} from "@/features/offers/offers.types"
import { findOverlappingActiveClaim } from "@/features/offers/utils/claimConflict"
import type {
  GetTimePickerConfigOptions,
  OfferTimeConfig,
} from "@/features/offers/utils/offerTimePicker"
import { getTimePickerConfig } from "@/features/offers/utils/offerTimePicker"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { GuestPickerSheet } from "./GuestPickerSheet"
import { PaymentSelector } from "./PaymentSelector"
import { TimeSlotSheet } from "./TimeSlotSheet"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma Heading M / M Accent (`16144:19979`). */
const CLAIM_MODAL_TITLE_CLASS =
  "m-0 p-0 text-primary text-[1.75rem] font-semibold leading-[2.25rem] tracking-[-0.616px] [font-feature-settings:'cv03'_on,'cv04'_on] [font-variant-numeric:lining-nums_proportional-nums] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

const PICKER_ROW_CLASS =
  "flex w-full flex-row items-center justify-between gap-3 rounded-[8px] border-0 bg-transparent px-6 pb-[13px] pt-[14px] text-left transition-colors hover:bg-active-neutral-secondary active:bg-active-neutral-secondary"

export interface ClaimOfferModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  offer: ClaimOfferModalOffer
  restaurantSlug: string
  claimedByOfferId: Readonly<Record<string, ClaimedOffer>>
  onClose: () => void
  onClaimed: (claimData: ClaimData) => void
  onConflict: (blocking: ClaimedOffer, claimData: ClaimData) => void
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

/**
 * Claim form (Figma `16144:19972`). Recalculates slot lists when the time picker opens.
 */
export function ClaimOfferModal({
  isOpen,
  onOpenChange,
  offer,
  restaurantSlug,
  claimedByOfferId,
  onClose,
  onClaimed,
  onConflict,
  container,
}: ClaimOfferModalProps) {
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

  const modalTitle = useMemo(
    () => formatOfferDiscountTitle(offer.discountPercent, offer.isAllDay),
    [offer.discountPercent, offer.isAllDay],
  )

  const peopleChipLabel = formatPeopleCountLabel(guestCount)

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onOpenChange(false)
        onClose()
      }
    },
    [onClose, onOpenChange],
  )

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
    const claimData: ClaimData = {
      arrivalTime,
      guestCount,
      paymentMethod,
    }
    const blocking = findOverlappingActiveClaim({
      restaurantSlug,
      offerId: offer.id,
      offer,
      claimData,
      claimedByOfferId,
    })
    if (blocking) {
      onConflict(blocking, claimData)
      return
    }
    onClaimed(claimData)
  }, [
    arrivalTime,
    guestCount,
    paymentMethod,
    onClaimed,
    onConflict,
    offer,
    restaurantSlug,
    claimedByOfferId,
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
    <>
      <ClaimPromoSheetShell
        open={isOpen}
        onOpenChange={handleDrawerOpenChange}
        container={container}
        zOverlay={Z_CLAIM_MODAL_OVERLAY}
        zContent={Z_CLAIM_MODAL_CONTENT}
        title={modalTitle}
        description={`${modalTitle} at ${offer.restaurantName}.`}
        hero="none"
        sheetHeight="fill"
        surfaceClass="bg-layer-floor-2"
        footerClassName="bg-layer-floor-2 pt-4 pb-[max(2rem,var(--safe-area-bottom))]"
        footer={
          <ClaimOfferFooterActions
            onClick={handleClaim}
            remainingCount={offer.remainingCount}
          />
        }
      >
        <div className="px-6 pb-3 pt-10">
          <h2 className={CLAIM_MODAL_TITLE_CLASS}>{modalTitle}</h2>
        </div>

        <input
          ref={timeInputRef}
          type="time"
          className="pointer-events-none fixed left-0 top-0 size-0 opacity-0"
          tabIndex={-1}
          aria-hidden
          step={60}
          min={nativeCfg.mode === "native" ? nativeCfg.minTime : undefined}
          max={nativeCfg.mode === "native" ? nativeCfg.maxTime : undefined}
          value={arrivalTime}
          onChange={(e) => setArrivalTime(e.target.value)}
        />

        <div className="flex flex-col">
          <button
            type="button"
            className={PICKER_ROW_CLASS}
            onClick={handleArrivalRowPress}
          >
            <Typography as="span" variant="body-m-regular" color="primary">
              When will you arrive?
            </Typography>
            <span className="pointer-events-none flex min-w-0 shrink-0 items-center gap-1 rounded-[8px] bg-neutral-secondary px-3 py-2">
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
            className={PICKER_ROW_CLASS}
            onClick={() => setGuestSheetOpen(true)}
          >
            <Typography as="span" variant="body-m-regular" color="primary">
              How many people?
            </Typography>
            <span className="pointer-events-none flex min-w-0 shrink-0 items-center gap-1 rounded-[8px] bg-neutral-secondary px-3 py-2">
              <Typography
                as="span"
                variant="body-m-accent"
                color="primary"
                inlineStyle={SEMIBOLD}
                noWrap
              >
                {peopleChipLabel}
              </Typography>
              <ChevronDown size="sm" className="shrink-0 text-tertiary" aria-hidden />
            </span>
          </button>
        </div>

        <div className="h-px w-full shrink-0 bg-separator" aria-hidden />

        <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

        <ClaimModalOfferDetails offer={offer} />
        <ClaimModalDisclaimer />
      </ClaimPromoSheetShell>

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
    </>
  )
}
