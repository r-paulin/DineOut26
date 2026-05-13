import { Typography } from "@bolteu/kalep-react"
import type { CSSProperties, RefObject } from "react"
import {
  payBillHeroMainPriceStyle,
  payBillNumericOpentype,
} from "@/features/payBill/utils/payBillNumericDisplay"

export interface ReceiptAmountBlockProps {
  label: string
  labelColor: "secondary" | "danger-primary"
  /** Target for GSAP wobble on invalid submit. */
  labelMotionRef?: RefObject<HTMLDivElement | null>
  /** Touch devices: autofocus native decimal keyboard on mount. */
  autoFocusInput: boolean
  display: { text: string; dim: boolean }
  amountRef: RefObject<HTMLSpanElement | null>
  scaleWrapRef: RefObject<HTMLSpanElement | null>
  hiddenInputRef: RefObject<HTMLInputElement | null>
  onTapAmount: () => void
  onHiddenInputChange: (raw: string) => void
  inputName: string
  inputAriaLabel: string
}

/** Figma `15942:12860` Input / Currency — 32px semibold; bottom padding optically aligns € with 64/72 hero digits. */
const euroSuffixStyle: CSSProperties = {
  ...payBillNumericOpentype,
  display: "inline-block",
  fontSize: 32,
  fontStyle: "normal",
  fontWeight: "var(--font-weight-semibold, 650)",
  lineHeight: 1,
  letterSpacing: "-0.704px",
  fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
  paddingBottom: "6px",
}

/**
 * Figma bill amount row: centered [digits][cursor][€]; native keyboard via transparent input.
 */
export function ReceiptAmountBlock({
  label,
  labelColor,
  labelMotionRef,
  autoFocusInput,
  display,
  amountRef,
  scaleWrapRef,
  hiddenInputRef,
  onTapAmount,
  onHiddenInputChange,
  inputName,
  inputAriaLabel,
}: ReceiptAmountBlockProps) {
  const showPlaceholderZero = !display.text

  return (
    <div className="flex w-full max-w-[min(100%,22rem)] flex-col items-center px-6">
      <div ref={labelMotionRef} className="w-full">
        <Typography variant="body-m-regular" color={labelColor} as="p" align="center">
          {label}
        </Typography>
      </div>
      <div
        className="relative mt-3 flex min-h-[72px] w-full cursor-text items-center justify-center"
        onClick={onTapAmount}
      >
        <input
          ref={hiddenInputRef}
          type="text"
          inputMode="decimal"
          name={inputName}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocusInput}
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
        <span
          ref={scaleWrapRef}
          className="pointer-events-none relative z-0 inline-flex min-h-[72px] items-center justify-center gap-1"
          aria-hidden
        >
          <span className="relative flex min-h-[72px] min-w-[1ch] shrink-0 items-center justify-end">
            {showPlaceholderZero ?
              <span
                className="pointer-events-none absolute inset-0 flex items-center justify-end pr-[2px] text-tertiary"
                style={payBillHeroMainPriceStyle}
              >
                0
              </span>
            : null}
            <span
              ref={amountRef}
              className={`relative z-[1] min-h-[72px] min-w-0 text-end ${
                showPlaceholderZero ?
                  "text-transparent"
                : display.dim ?
                  "text-tertiary"
                : "text-primary"
              }`}
              style={payBillHeroMainPriceStyle}
            />
          </span>
          <span
            className="bill-amount-cursor-blink mb-0 h-[72px] w-1 shrink-0 rounded-[2px] bg-action-primary"
            aria-hidden
          />
          <span
            className="flex min-h-[72px] shrink-0 flex-col items-center justify-center text-primary"
            aria-hidden
          >
            <span className="leading-none" style={euroSuffixStyle}>
              €
            </span>
          </span>
        </span>
      </div>
    </div>
  )
}
