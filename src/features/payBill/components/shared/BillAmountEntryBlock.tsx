import { Typography } from "@bolteu/kalep-react"
import type { CSSProperties, RefObject } from "react"
import {
  payBillHeroMainPriceStyle,
  payBillNumericOpentype,
} from "@/features/payBill/utils/payBillNumericDisplay"

export interface BillAmountEntryBlockProps {
  label: string
  coarse: boolean
  display: { text: string; dim: boolean }
  amountRef: RefObject<HTMLSpanElement | null>
  scaleWrapRef: RefObject<HTMLSpanElement | null>
  hiddenInputRef: RefObject<HTMLInputElement | null>
  onTapAmount: () => void
  onHiddenInputChange: (raw: string) => void
  inputName: string
  inputAriaLabel: string
  /** Outer column wrapper (spacing + alignment). */
  sectionClassName?: string
}

const euroBaseStyle: CSSProperties = {
  ...payBillNumericOpentype,
  fontSize: 36,
  fontStyle: "normal",
  fontWeight: "var(--font-weight-semibold, 650)",
  lineHeight: 1,
  letterSpacing: "-0.54px",
  fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
}

function heroAmountClassName(dim: boolean, hasText: boolean): string {
  if (dim && hasText) return "text-secondary"
  if (dim && !hasText) return "text-transparent"
  return "text-primary"
}

/**
 * Shared bill / custom-tip amount field: same layout as {@link BillAmountScreen}
 * (label, € + 64px digits, touch decimal field, desktop uses parent shell focus).
 */
export function BillAmountEntryBlock({
  label,
  coarse,
  display,
  amountRef,
  scaleWrapRef,
  hiddenInputRef,
  onTapAmount,
  onHiddenInputChange,
  inputName,
  inputAriaLabel,
  sectionClassName = "relative flex flex-1 flex-col items-center pt-[clamp(3rem,14vh,180px)]",
}: BillAmountEntryBlockProps) {
  const dimZero = display.dim

  return (
    <div className={sectionClassName}>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {label}
      </Typography>
      <div
        className="relative mt-3 flex min-h-[72px] w-full max-w-[min(100%,22rem)] cursor-text items-center justify-center px-4"
        onClick={onTapAmount}
      >
        {coarse ?
          <input
            ref={hiddenInputRef}
            type="text"
            inputMode="decimal"
            name={inputName}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            aria-label={inputAriaLabel}
            value={display.text}
            onChange={(ev) => {
              onHiddenInputChange(ev.target.value)
            }}
            onFocus={(ev) => {
              window.setTimeout(() => ev.target.select(), 0)
            }}
            className="absolute inset-0 z-[1] min-h-[72px] w-full cursor-text rounded-lg border-none bg-transparent p-0 text-left text-base leading-normal text-transparent outline-none ring-0 [caret-color:transparent] [-webkit-tap-highlight-color:transparent] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          />
        : null}
        <span
          ref={scaleWrapRef}
          className="relative z-0 inline-flex min-h-[72px] w-full items-center justify-center gap-2"
          {...(coarse ? { "aria-hidden": true as const } : {})}
        >
          <span
            className={`flex h-[72px] shrink-0 items-center ${
              dimZero ? "text-secondary" : "text-primary"
            }`}
            style={euroBaseStyle}
          >
            €
          </span>
          <span className="relative flex min-h-[72px] min-w-[1ch] shrink-0 items-center justify-center">
            {!display.text ?
              <span
                className={`pointer-events-none absolute inset-0 flex items-center justify-center ${heroAmountClassName(dimZero, false)}`}
                style={payBillHeroMainPriceStyle}
                aria-hidden
              >
                0
              </span>
            : null}
            <span
              ref={amountRef}
              className={`relative z-[1] min-h-[72px] min-w-0 ${heroAmountClassName(dimZero, Boolean(display.text))}`}
              style={payBillHeroMainPriceStyle}
              aria-live="polite"
            />
          </span>
        </span>
      </div>
    </div>
  )
}
