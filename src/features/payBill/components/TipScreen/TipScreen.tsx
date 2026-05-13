import { Button, Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import { useCallback, useMemo, useRef, useState } from "react"
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
 * Tip selection (Figma PAY BILL / Add a tip): % presets from receipt, custom modal, GSAP entrance.
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
    const presets = tipPercentPresets.map((pct, i) => {
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
      { id: "other", label: "Other", amount: null, isCustom: true },
    ]
  }, [receiptTotalEur, tipPercentPresets])

  const [selectedId, setSelectedId] = useState<string>(() => options[0]?.id ?? "")
  const [customAmount, setCustomAmount] = useState<number | null>(null)
  const [customModal, setCustomModal] = useState(false)

  const selected = options.find((o) => o.id === selectedId)
  const tipValue: number | null =
    selected?.isCustom ? customAmount
    : selected?.amount != null ?
      selected.amount
    : null

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
    setSelectedId("")
    setCustomAmount(null)
  }, [])

  const onContinuePress = useCallback(() => {
    const hasTip = tipValue != null && tipValue > 0
    onContinue({
      tip: hasTip ? tipValue : null,
      snackbarIntent: hasTip ? "tip-added" : "no-tip",
    })
  }, [onContinue, tipValue])

  const onSkipTip = useCallback(() => {
    onContinue({ tip: null, snackbarIntent: "no-tip" })
  }, [onContinue])

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
        <div className="min-h-[24px] min-w-0 flex-1 text-center">
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

      <div className="shrink-0 px-6">
        <div className="flex items-start justify-between gap-3 pb-5 pt-1">
          <Typography
            variant="body-m-accent"
            color="primary"
            as="p"
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            Receipt total
          </Typography>
          <Typography
            variant="body-s-accent"
            color="primary"
            as="p"
            align="end"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {formatEurMajor(receiptTotalEur)}
          </Typography>
        </div>
        <div
          className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
          aria-hidden
        />
      </div>

      <div className="flex flex-1 flex-col items-center px-6 pt-6">
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
          className="mt-10 flex max-w-[320px] flex-col items-center gap-1 text-center"
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
          <Typography
            variant="body-m-regular"
            color="secondary"
            align="center"
            as="p"
            lines={3}
          >
            This is a thank you for great service — 100% goes to the staff
          </Typography>
        </div>

        <div
          ref={tipRowRef}
          className="mt-10 flex w-full max-w-[360px] gap-[10px] px-0 pb-6"
        >
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
        </div>
      </div>

      <div
        ref={footerRef}
        className="sticky bottom-0 mt-auto flex w-full flex-col gap-3 bg-layer-floor-1 px-6 pb-[max(1rem,var(--safe-area-bottom))] pt-2"
      >
        <Button
          variant="primary"
          fullWidth
          onClick={onContinuePress}
          overrideClassName="!min-h-14 h-14 rounded-full"
        >
          Continue
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={onSkipTip}
          overrideClassName="!min-h-14 h-14 rounded-full"
        >
          Skip tip
        </Button>
      </div>

      <CustomTipModal
        open={customModal}
        onOpenChange={setCustomModal}
        initialCents={initialCustomCents}
        container={portalContainer ?? undefined}
        onSave={(eur) => {
          setCustomAmount(eur)
          setSelectedId("other")
        }}
      />
    </div>
  )
}
