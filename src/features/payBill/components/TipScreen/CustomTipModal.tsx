import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import type { CSSProperties } from "react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { BillAmountDisplayRow } from "@/features/payBill/components/shared/BillAmountDisplayRow"
import { useAnimatedBillCents } from "@/features/payBill/hooks/useAnimatedBillCents"
import {
  applyNumpadKey,
  billNumpadStateFromCents,
  billStateFromFormattedInput,
  billStateToCents,
  formatBillDisplayEur,
  initialBillNumpadState,
  isBillAmountValidForContinue,
  numpadKeyFromKeyboardEvent,
} from "@/features/payBill/utils/billAmount"
import { useCoarsePointer } from "@/shared/hooks/useCoarsePointer"
import { useVisualViewportLayout } from "@/shared/hooks/useVisualViewportLayout"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"

export interface CustomTipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCents: number
  /** Pay-bill shell (`position: relative`) — overlay uses `absolute` so the tip screen behind stays put. */
  container?: HTMLElement | null
  onSave: (amountEur: number) => void
}

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SHEET_MOTION =
  "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"

/** Figma `15935:24418` — custom tip sheet heading. */
const CUSTOM_TIP_HEADING = "Add a tip" as const

/**
 * Custom tip bottom sheet inside the pay-bill shell (Figma `15935:24418`).
 */
export function CustomTipModal({
  open,
  onOpenChange,
  initialCents,
  container,
  onSave,
}: CustomTipModalProps) {
  const coarse = useCoarsePointer()
  const vvLayout = useVisualViewportLayout(open && coarse)
  const reduceMotion = prefersReducedMotion()
  const [entered, setEntered] = useState(reduceMotion)
  const [state, setState] = useState(initialBillNumpadState)
  const amountRef = useRef<HTMLSpanElement>(null)
  const scaleWrapRef = useRef<HTMLSpanElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const cents = billStateToCents(state)
  useAnimatedBillCents(state, amountRef, scaleWrapRef)
  const display = formatBillDisplayEur(state, { dimWhenZero: true })

  useLayoutEffect(() => {
    if (!open) {
      setEntered(reduceMotion)
      return
    }
    if (reduceMotion) {
      setEntered(true)
      return
    }
    setEntered(false)
    const id = window.requestAnimationFrame(() => {
      setEntered(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, reduceMotion])

  useEffect(() => {
    if (!open) return
    setState(billNumpadStateFromCents(initialCents))
  }, [open, initialCents])

  useEffect(() => {
    if (!open || coarse) return
    const id = window.requestAnimationFrame(() => {
      shellRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, coarse])

  useLayoutEffect(() => {
    if (!open || !coarse) return
    const id = window.requestAnimationFrame(() => {
      hiddenInputRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [open, coarse])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onOpenChange])

  const onShellKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (document.activeElement !== shellRef.current) return
      const k = numpadKeyFromKeyboardEvent(e)
      if (k == null) return
      e.preventDefault()
      setState((s) => applyNumpadKey(s, k))
    },
    [],
  )

  const valid = isBillAmountValidForContinue(state)

  const sheetStyle: CSSProperties | undefined =
    coarse && vvLayout && vvLayout.overlapBottom > 0 ?
      (() => {
        const visibleMax = Math.max(240, vvLayout.height - 8)
        const innerH =
          typeof window !== "undefined" ? window.innerHeight : 640
        return {
          bottom: vvLayout.overlapBottom,
          maxHeight: visibleMax,
          minHeight: Math.min(Math.round(innerH * 0.35), visibleMax),
        }
      })()
    : undefined

  if (!open || !container) return null

  const sheetMotionClass =
    reduceMotion ? ""
    : `${SHEET_MOTION} ${entered ? "translate-y-0" : "translate-y-full"}`
  const scrimMotionClass =
    reduceMotion ? "" : `${SHEET_MOTION} ${entered ? "opacity-100" : "opacity-0"}`

  return createPortal(
    <>
      <div
        role="presentation"
        className={`absolute inset-0 z-[200] bg-special-scrim ${scrimMotionClass}`}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onOpenChange(false)
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-tip-heading"
        style={sheetStyle}
        className={[
          "absolute inset-x-0 bottom-0 z-[201] flex max-h-[min(90dvh,100%)] min-h-[70%]",
          "flex-col rounded-t-[16px] bg-layer-floor-1 px-0 pb-0 outline-none",
          "overflow-hidden shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
          sheetMotionClass,
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="Close"
          className={`${SHEET_CLOSE_ON_SURFACE_NESTED_CLASS} !right-3 !top-3 z-[2] !size-7`}
          onClick={() => onOpenChange(false)}
        >
          <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
        </button>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center p-6">
          <div className="flex w-full flex-col items-center pb-6">
            <h2
              id="custom-tip-heading"
              className="m-0 w-full text-center"
            >
              <Typography
                variant="heading-m-accent"
                color="primary"
                align="center"
                as="span"
                inlineStyle={{
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                  fontFeatureSettings: FONT_FEAT,
                }}
              >
                {CUSTOM_TIP_HEADING}
              </Typography>
            </h2>
          </div>

          <div
            ref={shellRef}
            tabIndex={coarse ? -1 : 0}
            onKeyDown={coarse ? undefined : onShellKeyDown}
            className="flex w-full max-w-[min(100%,22rem)] shrink-0 outline-none"
          >
            <BillAmountDisplayRow
              display={display}
              amountRef={amountRef}
              scaleWrapRef={scaleWrapRef}
              hiddenInputRef={hiddenInputRef}
              onHiddenInputChange={(raw) => {
                setState(billStateFromFormattedInput(raw))
              }}
              inputName="customTipAmount"
              inputAriaLabel="Custom tip amount in euros"
              nativeInput={coarse}
              autoFocusInput={coarse}
              selectAllOnFirstFocus={coarse}
              onTap={() => {
                if (coarse) hiddenInputRef.current?.focus()
                else shellRef.current?.focus()
              }}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 p-6 pb-[max(1.5rem,var(--safe-area-bottom))]">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!valid}
            onClick={() => {
              onSave(cents / 100)
              onOpenChange(false)
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </>,
    container,
  )
}
