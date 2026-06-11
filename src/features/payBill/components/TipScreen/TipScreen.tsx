import { Button, Typography } from "@bolteu/kalep-react"
import { PayBillScreenHeader } from "@/features/payBill/components/shared/PayBillScreenHeader"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import tipHandsUrl from "@/features/payBill/assets/tip-hands.png"
import { CustomTipModal } from "@/features/payBill/components/TipScreen/CustomTipModal"
import { TipPill } from "@/features/payBill/components/TipScreen/TipPill"
import { useTipScreenEntrance, useTipScreenEntranceLock } from "@/features/payBill/hooks/useTipScreenEntrance"
import type { TipOption } from "@/features/payBill/payBill.types"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import {
  formatTipScreenBillTotalLabel,
  TIP_SCREEN_SUBTITLE,
} from "@/features/payBill/constants/tipScreenCopy"
import { percentTipEur, TIP_SCREEN_PERCENT_PRESET_LIMIT } from "@/features/payBill/utils/tipPresets"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface TipScreenProps {
  restaurantName: string
  receiptTotalEur: number
  tipPercentPresets: number[]
  /** Pay-bill shell element for the custom-tip overlay (keeps the tip screen static). */
  sheetContainer?: HTMLElement | null
  onBack: () => void
  onContinue: (payload: {
    tip: number | null
    snackbarIntent: "tip-added" | "no-tip"
  }) => void
}

/**
 * Tip selection (Figma `15822:12199`): 5%, 10%, 15%, No tip, Other;
 * Continue only after the user picks an option; footer reserves CTA height to avoid layout shift.
 */
export function TipScreen({
  restaurantName,
  receiptTotalEur,
  tipPercentPresets,
  sheetContainer,
  onBack,
  onContinue,
}: TipScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const illustrationRef = useRef<HTMLDivElement>(null)
  const titleBlockRef = useRef<HTMLDivElement>(null)
  const tipRowRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  const [selectedId, setSelectedId] = useState("")
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [customModal, setCustomModal] = useState(false)
  const customAmountRef = useRef<number | null>(null)
  const scrollTopRef = useRef(0)

  useTipScreenEntrance(
    rootRef,
    illustrationRef,
    titleBlockRef,
    tipRowRef,
    footerRef,
  )

  useTipScreenEntranceLock(
    illustrationRef,
    titleBlockRef,
    tipRowRef,
    footerRef,
    customModal,
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (customModal) {
      scrollTopRef.current = root.scrollTop
      root.scrollTop = scrollTopRef.current
    }
  }, [customModal])

  const options: TipOption[] = useMemo(() => {
    const noneOption: TipOption = {
      id: "none",
      label: "No tip",
      amount: 0,
    }
    const percents = (() => {
      const p = [...tipPercentPresets]
      if (!p.includes(5)) p.unshift(5)
      return [...new Set(p)]
        .sort((a, b) => a - b)
        .slice(0, TIP_SCREEN_PERCENT_PRESET_LIMIT)
    })()
    const presets = percents.map((pct, i) => {
      const eur = percentTipEur(receiptTotalEur, pct)
      return {
        id: `p${i}`,
        label: formatEurMajor(eur),
        secondaryLabel: `${pct}%`,
        amount: eur,
      }
    })
    return [
      ...presets,
      noneOption,
      { id: "other", label: "Other", amount: null, isCustom: true },
    ]
  }, [receiptTotalEur, tipPercentPresets])

  useEffect(() => {
    customAmountRef.current = customAmount
  }, [customAmount])

  const presetOptions = useMemo(
    () => options.filter((o) => o.id.startsWith("p")),
    [options],
  )
  const tailOptions = useMemo(
    () => options.filter((o) => o.id === "none" || o.id === "other"),
    [options],
  )

  const selected = options.find((o) => o.id === selectedId)
  const tipValue: number | null =
    selected?.isCustom ? customAmount
    : selected?.amount != null ?
      selected.amount
    : null

  const canContinue =
    selectedId !== "" &&
    (!selected?.isCustom || customAmount != null)

  const openOther = useCallback(() => {
    if (rootRef.current) {
      scrollTopRef.current = rootRef.current.scrollTop
    }
    setSelectedId("other")
    setCustomModal(true)
  }, [])

  const handleSelect = useCallback(
    (opt: TipOption) => {
      if (opt.isCustom) {
        openOther()
        return
      }
      setSelectedId(opt.id)
    },
    [openOther],
  )

  const handleDeselect = useCallback(() => {
    customAmountRef.current = null
    setSelectedId("")
    setCustomAmount(null)
  }, [])

  const renderTipPill = (opt: TipOption) => {
    const isSel = selectedId === opt.id
    const displayOpt =
      opt.isCustom && customAmount != null ?
        { ...opt, label: formatEurMajor(customAmount) }
      : opt
    return (
      <TipPill
        key={opt.id}
        option={displayOpt}
        isSelected={isSel}
        onSelect={() => handleSelect(opt)}
        onDeselect={() => {
          if (opt.isCustom && isSel) {
            if (rootRef.current) {
              scrollTopRef.current = rootRef.current.scrollTop
            }
            setCustomModal(true)
            return
          }
          handleDeselect()
        }}
      />
    )
  }

  const onContinuePress = useCallback(() => {
    if (!canContinue) return
    const hasTip = tipValue != null && tipValue > 0
    onContinue({
      tip: hasTip ? tipValue : null,
      snackbarIntent: hasTip ? "tip-added" : "no-tip",
    })
  }, [canContinue, onContinue, tipValue])

  const initialCustomCents =
    customAmount != null ? Math.round(customAmount * 100) : 0

  return (
    <>
    <div
      ref={rootRef}
      className={[
        "flex h-[var(--app-h)] max-h-[var(--app-h)] w-full flex-col bg-layer-floor-1",
        customModal ?
          "pointer-events-none touch-none overflow-hidden overscroll-none"
        : "overflow-y-auto",
      ].join(" ")}
      aria-hidden={customModal ? true : undefined}
    >
      <PayBillScreenHeader title={restaurantName} onBack={onBack} />

      <div className="flex min-h-0 flex-1 flex-col items-center pt-6">
        <div className="flex w-full max-w-[min(100%,24rem)] flex-col items-center gap-6 px-6">
          <div
            ref={illustrationRef}
            className="flex h-[148px] w-[200px] shrink-0 items-center justify-center overflow-hidden"
          >
            <img
              src={tipHandsUrl}
              alt=""
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
          <div
            ref={titleBlockRef}
            className="flex w-full flex-col items-center gap-1 text-center"
          >
            <Typography
              variant="heading-m-accent"
              color="primary"
              align="center"
              as="h1"
              inlineStyle={{
                fontVariationSettings: "'wght' var(--font-weight-semibold)",
                fontFeatureSettings: FONT_FEAT,
              }}
            >
              Tip your waiter
            </Typography>
            <Typography variant="body-m-regular" color="secondary" align="center" as="p">
              {TIP_SCREEN_SUBTITLE}
            </Typography>
          </div>
        </div>

        <div
          ref={tipRowRef}
          className="mt-6 flex w-full max-w-[min(100%,24rem)] shrink-0 flex-col items-center gap-6 px-6 pb-6"
        >
          <div className="flex w-full flex-col gap-2">
            <div className="grid w-full grid-cols-3 gap-2">
              {presetOptions.map(renderTipPill)}
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              {tailOptions.map(renderTipPill)}
            </div>
          </div>
          <div className="w-full px-0">
            <Typography
              variant="body-s-regular"
              color="secondary"
              align="center"
              as="p"
              inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
            >
              {formatTipScreenBillTotalLabel(receiptTotalEur)}
            </Typography>
          </div>
        </div>
      </div>

      <div
        ref={footerRef}
        data-snackbar-anchor=""
        className="sticky bottom-0 mt-auto flex w-full shrink-0 flex-col bg-layer-floor-1 px-6 pb-[max(1rem,var(--safe-area-bottom))] pt-6"
      >
        {/*
          Reserve primary CTA height so Continue appearing after a choice does not shift layout
          (Figma `15822:12199` default vs `15767:50968` selected).
        */}
        <div className="flex min-h-14 w-full flex-col justify-center gap-4">
          {canContinue ?
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onContinuePress}
            >
              Continue
            </Button>
          : (
            <span
              className="block min-h-14 w-full shrink-0"
              aria-hidden
            />
          )}
        </div>
      </div>
    </div>

    {sheetContainer ?
      <CustomTipModal
        open={customModal}
        onOpenChange={(open) => {
          setCustomModal(open)
          if (!open) {
            // Modal calls onOpenChange(false) in the same tick as onSave; customAmount state
            // is not committed yet, so rely on customAmountRef (set synchronously in onSave).
            setSelectedId((id) =>
              id === "other" && customAmountRef.current === null ? "" : id,
            )
          }
        }}
        initialCents={initialCustomCents}
        container={sheetContainer}
        onSave={(eur) => {
          customAmountRef.current = eur
          setCustomAmount(eur)
          setSelectedId("other")
        }}
      />
    : null}
    </>
  )
}
