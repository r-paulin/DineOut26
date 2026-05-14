import { Typography } from "@bolteu/kalep-react"
import type { CSSProperties, RefObject } from "react"
import {
  payBillHeroMainPriceStyle,
  payBillHeroPlaceholderZeroStyle,
  payBillNumericOpentype,
} from "@/features/payBill/utils/payBillNumericDisplay"

export interface ReceiptAmountBlockProps {
  /** Shown below the amount row (invalid submit). */
  errorMessage?: string | null
  /** Target for GSAP wobble on invalid submit. */
  errorMotionRef?: RefObject<HTMLDivElement | null>
  /** `aria-describedby` on the input when `errorMessage` is set. */
  errorId?: string
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

/** € ~65% of hero digit size; 8px bottom padding; line-height 1. */
const euroSuffixStyle: CSSProperties = {
  ...payBillNumericOpentype,
  display: "inline-block",
  fontSize: 42,
  fontStyle: "normal",
  fontWeight: 650,
  lineHeight: 1,
  letterSpacing: "-0.462px",
  fontVariationSettings: "'wght' 650",
  paddingBottom: "8px",
}

/**
 * Bill amount field — pill surface, [0][cursor][€] centered; native keyboard via transparent input.
 */
export function ReceiptAmountBlock({
  errorMessage,
  errorMotionRef,
  errorId,
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
      <div
        className="relative flex min-h-[72px] w-full cursor-text items-center justify-center gap-0.5 rounded-full border border-solid border-separator bg-neutral-secondary px-6 outline-none transition-colors focus-within:border-action-primary focus-within:bg-layer-floor-1 focus-within:ring-2 focus-within:ring-action-primary"
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
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={
            errorMessage && errorId ? errorId : undefined
          }
          value={display.text}
          onChange={(ev) => {
            onHiddenInputChange(ev.target.value)
          }}
          onFocus={(ev) => {
            window.setTimeout(() => ev.target.select(), 0)
          }}
          className="absolute inset-0 z-[1] min-h-[72px] w-full cursor-text rounded-full border-none bg-transparent p-0 text-left text-base leading-normal text-transparent outline-none ring-0 [caret-color:transparent] focus-visible:ring-0"
        />
        <span
          ref={scaleWrapRef}
          className="pointer-events-none relative z-0 inline-flex min-h-[72px] items-end justify-center gap-0.5"
          aria-hidden
        >
          <span className="relative flex min-h-[72px] min-w-[1ch] shrink-0 items-end justify-end">
            {showPlaceholderZero ?
              <span
                className="pointer-events-none absolute inset-0 flex items-end justify-end pr-[2px] text-tertiary"
                style={payBillHeroPlaceholderZeroStyle}
              >
                0
              </span>
            : null}
            <span
              ref={amountRef}
              className={`relative z-[1] flex min-h-[72px] min-w-0 items-end justify-end text-end ${
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
            className="bill-amount-cursor-blink mb-[2px] h-[64px] w-1 shrink-0 rounded-[2px] bg-action-primary"
            aria-hidden
          />
          <span className="flex shrink-0 items-end text-primary" aria-hidden>
            <span style={euroSuffixStyle}>
              €
            </span>
          </span>
        </span>
      </div>

      <div
        ref={errorMotionRef}
        className="mt-3 flex min-h-[24px] w-full justify-center px-1"
        aria-live="polite"
      >
        {errorMessage ?
          <div id={errorId} className="w-full">
            <Typography
              variant="body-m-regular"
              color="danger-primary"
              as="p"
              align="center"
            >
              {errorMessage}
            </Typography>
          </div>
        : null}
      </div>
    </div>
  )
}
