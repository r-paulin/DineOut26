import { Button, Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import tipHandsUrl from "@/features/payBill/assets/tip-hands.png"
import { CustomTipModal } from "@/features/payBill/components/TipScreen/CustomTipModal"
import { TipPill } from "@/features/payBill/components/TipScreen/TipPill"
import { useTipScreenEntrance } from "@/features/payBill/hooks/useTipScreenEntrance"
import type { TipOption } from "@/features/payBill/payBill.types"
import { formatEurMajor } from "@/features/payBill/utils/formatEur"
import { percentTipEur } from "@/features/payBill/utils/tipPresets"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface TipScreenProps {
  restaurantName: string
  receiptTotalEur: number
  tipPercentPresets: number[]
  portalContainer?: HTMLElement | null
  onBack: () => void
  onContinue: (payload: {
    tip: number | null
    snackbarIntent: "tip-added" | "no-tip"
  }) => void
}

/**
 * Tip selection (Figma `15822:12199` default, `15767:50968` selected): 3×2 grid;
 * Continue only after the user picks an option; footer reserves CTA height to avoid layout shift.
 */
export function TipScreen({
  restaurantName,
  receiptTotalEur,
  tipPercentPresets,
  portalContainer,
  onBack,
  onContinue,
}: TipScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const illustrationRef = useRef<HTMLDivElement>(null)
  const titleBlockRef = useRef<HTMLDivElement>(null)
  const tipRowRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useTipScreenEntrance(
    rootRef,
    illustrationRef,
    titleBlockRef,
    tipRowRef,
    footerRef,
  )

  const options: TipOption[] = useMemo(() => {
    const noneOption: TipOption = {
      id: "none",
      label: formatEurMajor(0),
      secondaryLabel: "No tip",
      amount: 0,
    }
    const percents = (() => {
      const p = [...tipPercentPresets]
      if (!p.includes(5)) p.unshift(5)
      return [...new Set(p)].sort((a, b) => a - b)
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
    /** Six tiles: 5%…presets, then No tip, then Other (last). */
    return [
      ...presets,
      noneOption,
      { id: "other", label: "Other", amount: null, isCustom: true },
    ]
  }, [receiptTotalEur, tipPercentPresets])

  const [selectedId, setSelectedId] = useState("")
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [customModal, setCustomModal] = useState(false)
  const customAmountRef = useRef<number | null>(null)

  useEffect(() => {
    customAmountRef.current = customAmount
  }, [customAmount])

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
    <div
      ref={rootRef}
      className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full flex-col overflow-y-auto bg-layer-floor-1"
    >
      <header className="flex shrink-0 items-center gap-4 px-6 pt-[max(1rem,var(--safe-area-top))] pb-3">
        <button
          type="button"
          aria-label="Back"
          onClick={onBack}
          className="flex size-6 shrink-0 items-center justify-center rounded-full border-none bg-transparent p-0 text-primary outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
        >
          <ArrowLeft size="md" className="text-primary" aria-hidden />
        </button>
        <div className="flex min-h-[24px] min-w-0 flex-1 items-center justify-center">
          <Typography
            variant="body-l-accent"
            color="primary"
            as="p"
            align="center"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {restaurantName}
          </Typography>
        </div>
        <span className="size-6 shrink-0" aria-hidden />
      </header>

      <div className="h-px w-full shrink-0 bg-separator" aria-hidden />

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
              This is a thank you for great service — 100% goes to the staff
            </Typography>
          </div>
        </div>

        <div
          ref={tipRowRef}
          className="mt-6 flex w-full max-w-[min(100%,24rem)] shrink-0 flex-col items-center gap-6 px-6 pb-6"
        >
          <div className="grid w-full grid-cols-3 gap-2">
            {options.map((opt) => {
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
                      setCustomModal(true)
                      return
                    }
                    handleDeselect()
                  }}
                />
              )
            })}
            {options.length % 3 !== 0 ?
              Array.from({ length: 3 - (options.length % 3) }, (_, i) => (
                <span
                  key={`tip-grid-pad-${i}`}
                  className="min-h-[60px] min-w-0 shrink-0"
                  aria-hidden
                />
              ))
            : null}
          </div>
          <div className="w-full px-0">
            <Typography
              variant="body-s-regular"
              color="secondary"
              align="center"
              as="p"
              inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
            >
              Total on receipt: {formatEurMajor(receiptTotalEur)}
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
        container={portalContainer ?? undefined}
        onSave={(eur) => {
          customAmountRef.current = eur
          setCustomAmount(eur)
          setSelectedId("other")
        }}
      />
    </div>
  )
}
