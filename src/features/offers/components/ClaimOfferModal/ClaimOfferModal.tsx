import { Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import ChevronDown from "@bolteu/kalep-react-icons/dist/ChevronDown"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type AnimationEvent,
} from "react"
import { ClaimModalDisclaimer } from "@/features/offers/components/ClaimOfferModal/ClaimModalDisclaimer"
import { ClaimOfferFooterActions } from "@/features/offers/components/ClaimOfferModal/ClaimOfferFooterActions"
import { formatPeopleCountLabel } from "@/features/offers/components/ClaimOfferModal/formatPeopleCountLabel"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import { formatOfferDiscountTitle } from "@/features/offers/utils/formatOfferDiscountTitle"
import { DineOutCashbackBanner } from "@/features/offers/components/DineOutCashbackBanner"
import type {
  ClaimData,
  ClaimedOffer,
  ClaimOfferModalOffer,
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
import {
  MOTION_REDUCED_S,
  MOTION_SHEET_SEQUENTIAL_GAP_S,
  motionReduced,
} from "@/shared/motion"
import { GuestPickerSheet } from "./GuestPickerSheet"
import { TimeSlotSheet } from "./TimeSlotSheet"

/** Claim flow always uses Bolt Food / DineOut (Figma `16142:22260`). */
const CLAIM_PAYMENT_METHOD = "dineout" as const

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const BODY_M_COMPACT = {
  ...SEMIBOLD,
  lineHeight: "var(--body-m-compact-line-height, 20px)",
} as const

/** Figma Heading M / M Accent (`16142:22268`). */
const CLAIM_MODAL_TITLE_CLASS =
  "m-0 p-0 text-primary text-[1.75rem] font-semibold leading-[2.25rem] tracking-[-0.616px] [font-feature-settings:'cv03'_on,'cv04'_on] [font-variant-numeric:lining-nums_proportional-nums] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

/** Figma List Item row — 12px vertical padding, no separators (`17902:35009`). */
const PICKER_ROW_CLASS =
  "flex w-full flex-row items-center justify-between gap-3 border-0 bg-transparent px-6 py-3 text-left transition-colors hover:bg-active-neutral-secondary active:bg-active-neutral-secondary"

/**
 * Figma Main Button S in list end-slot — pill, 36px min height, body-s accent.
 */
const PICKER_VALUE_PILL_CLASS =
  "pointer-events-none inline-flex min-h-9 min-w-0 shrink-0 items-center justify-center gap-1 rounded-full bg-neutral-secondary px-3 py-2"

type PickerKind = "guests" | "time"

export interface ClaimOfferModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  offer: ClaimOfferModalOffer
  restaurantSlug: string
  claimedByOfferId: Readonly<Record<string, ClaimedOffer>>
  onClose: () => void
  /** Fires once after the sheet finish animating closed. */
  onExitComplete?: () => void
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

function sequentialGapMs(): number {
  return Math.round(
    (motionReduced() ? MOTION_REDUCED_S : MOTION_SHEET_SEQUENTIAL_GAP_S) * 1000,
  )
}

/**
 * Claim form (Figma `16142:22260`). Recalculates slot lists when the time picker opens.
 * Guest/time pickers use iOS-style sequential sheets (claim dismisses first).
 */
export function ClaimOfferModal({
  isOpen,
  onOpenChange,
  offer,
  restaurantSlug,
  claimedByOfferId,
  onClose,
  onExitComplete,
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
  const [slotList, setSlotList] = useState<string[]>([])

  const [claimSurfaceOpen, setClaimSurfaceOpen] = useState(false)
  const [pickerKind, setPickerKind] = useState<PickerKind | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pendingPickerRef = useRef<PickerKind | null>(null)
  const reopenClaimAfterPickerRef = useRef(false)
  const pickerExitHandledRef = useRef(false)
  const sequentialTimerRef = useRef<number | null>(null)

  const clearSequentialTimer = useCallback(() => {
    if (sequentialTimerRef.current != null) {
      window.clearTimeout(sequentialTimerRef.current)
      sequentialTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setClaimSurfaceOpen(true)
      return
    }
    clearSequentialTimer()
    setClaimSurfaceOpen(false)
    setPickerOpen(false)
    setPickerKind(null)
    pendingPickerRef.current = null
    reopenClaimAfterPickerRef.current = false
  }, [isOpen, clearSequentialTimer])

  useEffect(() => () => clearSequentialTimer(), [clearSequentialTimer])

  const modalTitle = useMemo(
    () => formatOfferDiscountTitle(offer.discountPercent, offer.isAllDay),
    [offer.discountPercent, offer.isAllDay],
  )

  const peopleChipLabel = formatPeopleCountLabel(guestCount)

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        // Programmatic hide for sequential pickers — keep parent claim flow open.
        if (pendingPickerRef.current || pickerKind != null) return
        onOpenChange(false)
        onClose()
      }
    },
    [onClose, onOpenChange, pickerKind],
  )

  const requestPicker = useCallback((kind: PickerKind) => {
    pendingPickerRef.current = kind
    setClaimSurfaceOpen(false)
  }, [])

  const handleClaimContentAnimationEnd = useCallback(
    (e: AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (claimSurfaceOpen) return

      const pending = pendingPickerRef.current
      if (pending) {
        pendingPickerRef.current = null
        setPickerKind(pending)
        pickerExitHandledRef.current = false
        clearSequentialTimer()
        sequentialTimerRef.current = window.setTimeout(() => {
          sequentialTimerRef.current = null
          setPickerOpen(true)
        }, sequentialGapMs())
        return
      }

      if (!isOpen) onExitComplete?.()
    },
    [claimSurfaceOpen, clearSequentialTimer, isOpen, onExitComplete],
  )

  const handlePickerOpenChange = useCallback((open: boolean) => {
    if (open) {
      setPickerOpen(true)
      return
    }
    setPickerOpen(false)
    reopenClaimAfterPickerRef.current = true
  }, [])

  const handlePickerExitComplete = useCallback(() => {
    if (pickerExitHandledRef.current) return
    pickerExitHandledRef.current = true
    setPickerKind(null)
    if (reopenClaimAfterPickerRef.current && isOpen) {
      reopenClaimAfterPickerRef.current = false
      clearSequentialTimer()
      sequentialTimerRef.current = window.setTimeout(() => {
        sequentialTimerRef.current = null
        setClaimSurfaceOpen(true)
      }, sequentialGapMs())
    }
  }, [clearSequentialTimer, isOpen])

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
      requestPicker("time")
      return
    }
    const el = timeInputRef.current
    if (!el) return
    try {
      el.showPicker?.()
    } catch {
      el.click()
    }
  }, [arrivalTime, timeCfgBase, schedulePickerOpts, onClose, requestPicker])

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
      paymentMethod: CLAIM_PAYMENT_METHOD,
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
        open={claimSurfaceOpen}
        onOpenChange={handleDrawerOpenChange}
        onContentAnimationEnd={handleClaimContentAnimationEnd}
        container={container}
        zOverlay={Z_CLAIM_MODAL_OVERLAY}
        zContent={Z_CLAIM_MODAL_CONTENT}
        title={modalTitle}
        description={`${modalTitle} at ${offer.restaurantName}.`}
        hero="none"
        sheetHeight="fit"
        surfaceClass="bg-layer-floor-2"
        footerClassName="bg-layer-floor-2 pt-4 pb-[max(2rem,var(--safe-area-bottom))]"
        footer={<ClaimOfferFooterActions onClick={handleClaim} />}
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
            <Typography
              as="span"
              variant="body-m-accent"
              color="primary"
              inlineStyle={BODY_M_COMPACT}
            >
              When will you arrive?
            </Typography>
            <span className={PICKER_VALUE_PILL_CLASS}>
              <Typography
                as="span"
                variant="body-s-accent"
                color="primary"
                inlineStyle={SEMIBOLD}
                noWrap
              >
                {arrivalTime}
              </Typography>
              <ChevronDown size="sm" className="shrink-0 text-primary" aria-hidden />
            </span>
          </button>

          <button
            type="button"
            className={PICKER_ROW_CLASS}
            onClick={() => requestPicker("guests")}
          >
            <Typography
              as="span"
              variant="body-m-accent"
              color="primary"
              inlineStyle={BODY_M_COMPACT}
            >
              How many people?
            </Typography>
            <span className={PICKER_VALUE_PILL_CLASS}>
              <Typography
                as="span"
                variant="body-s-accent"
                color="primary"
                inlineStyle={SEMIBOLD}
                noWrap
              >
                {peopleChipLabel}
              </Typography>
              <ChevronDown size="sm" className="shrink-0 text-primary" aria-hidden />
            </span>
          </button>
        </div>

        {/* Figma `16142:22260` — cashback banner only. */}
        <div className="w-full shrink-0 px-6 py-6">
          <DineOutCashbackBanner />
        </div>

        <ClaimModalDisclaimer date={offer.date} timeWindow={offer.timeWindow} />
      </ClaimPromoSheetShell>

      {pickerKind === "time" ?
        <TimeSlotSheet
          isOpen={pickerOpen}
          onOpenChange={handlePickerOpenChange}
          onExitComplete={handlePickerExitComplete}
          slots={slotList}
          value={arrivalTime}
          onChange={setArrivalTime}
          container={container}
        />
      : null}
      {pickerKind === "guests" ?
        <GuestPickerSheet
          isOpen={pickerOpen}
          onOpenChange={handlePickerOpenChange}
          onExitComplete={handlePickerExitComplete}
          value={guestCount}
          onChange={setGuestCount}
          container={container}
        />
      : null}
    </>
  )
}
