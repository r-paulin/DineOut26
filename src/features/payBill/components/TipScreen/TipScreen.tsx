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
 * Tip selection (Figma `15822:12199` PAY BILL / Add a tip): horizontal tip chips incl. No tip, presets, Other; custom modal; GSAP entrance.
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
      label: "0 €",
      secondaryLabel: "No tip",
      amount: 0,
    }
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
      noneOption,
      ...presets,
      { id: "other", label: "Other", amount: null, isCustom: true },
    ]
  }, [receiptTotalEur, tipPercentPresets])

  const [selectedId, setSelectedId] = useState("")
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

      <div className="flex min-h-0 flex-1 flex-col items-center gap-6 px-6 pb-6 pt-6">
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
          className="flex w-full max-w-[min(100%,24rem)] flex-col items-center gap-1 px-0 text-center"
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

        <div
          ref={tipRowRef}
          className="flex w-full shrink-0 flex-col items-center gap-6"
        >
          <div className="w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max min-w-full flex-nowrap items-stretch gap-2 pb-0 pt-0">
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

      <div
        ref={footerRef}
        className="sticky bottom-0 mt-auto flex w-full shrink-0 flex-col gap-4 bg-layer-floor-1 px-6 pb-[max(1rem,var(--safe-area-bottom))] pt-6"
      >
        <Button
          variant="primary"
          fullWidth
          onClick={onContinuePress}
          overrideClassName="!min-h-14 h-14 rounded-full"
        >
          Continue
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
