import type { RefObject } from "react"
import { useRef, useState } from "react"
import {
  payBillEuroSuffixStyle,
  payBillHeroMainPriceStyle,
  payBillHeroPlaceholderZeroStyle,
} from "@/features/payBill/utils/payBillNumericDisplay"

const NATIVE_INPUT_CLASS =
  "absolute inset-0 z-[1] min-h-[72px] w-full cursor-text border-none bg-transparent p-0 text-left text-base leading-normal text-transparent shadow-none outline-none outline-offset-0 ring-0 [caret-color:transparent] focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"

export interface BillAmountDisplayRowProps {
  display: { text: string; dim: boolean }
  amountRef: RefObject<HTMLSpanElement | null>
  scaleWrapRef: RefObject<HTMLSpanElement | null>
  hiddenInputRef: RefObject<HTMLInputElement | null>
  onHiddenInputChange: (raw: string) => void
  inputName: string
  inputAriaLabel: string
  /** When false (desktop custom tip), omit native input; overlay stays in the a11y tree. */
  nativeInput?: boolean
  autoFocusInput?: boolean
  ariaInvalid?: boolean
  ariaDescribedBy?: string
  onTap?: () => void
  /** Select all text only on the first focus (autofocus), not on subsequent taps. */
  selectAllOnFirstFocus?: boolean
  className?: string
}

/**
 * Shared [digits][cursor][€] row for bill amount and custom tip entry.
 */
export function BillAmountDisplayRow({
  display,
  amountRef,
  scaleWrapRef,
  hiddenInputRef,
  onHiddenInputChange,
  inputName,
  inputAriaLabel,
  nativeInput = true,
  autoFocusInput = false,
  ariaInvalid = false,
  ariaDescribedBy,
  onTap,
  selectAllOnFirstFocus = false,
  className = "",
}: BillAmountDisplayRowProps) {
  const showPlaceholderZero = !display.text
  const [inputFocused, setInputFocused] = useState(false)
  const didSelectOnFocusRef = useRef(false)

  const showCursor = nativeInput && inputFocused

  return (
    <div
      className={[
        "relative flex min-h-[72px] w-full cursor-text items-center justify-center gap-0.5 outline-none",
        nativeInput ? "focus-within:ring-2 focus-within:ring-action-primary" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={nativeInput ? undefined : onTap}
    >
      {nativeInput ?
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
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          value={display.text}
          onChange={(ev) => {
            onHiddenInputChange(ev.target.value)
          }}
          onFocus={(ev) => {
            setInputFocused(true)
            if (selectAllOnFirstFocus && !didSelectOnFocusRef.current) {
              didSelectOnFocusRef.current = true
              window.setTimeout(() => ev.target.select(), 0)
            }
          }}
          onBlur={() => {
            setInputFocused(false)
          }}
          className={NATIVE_INPUT_CLASS}
        />
      : null}
      <span
        ref={scaleWrapRef}
        className="pointer-events-none relative z-0 inline-flex min-h-[72px] items-end justify-center gap-0.5"
        {...(nativeInput ? { "aria-hidden": true as const } : {})}
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
            {...(!nativeInput ? { "aria-live": "polite" as const } : {})}
          />
        </span>
        {showCursor ?
          <span
            className="bill-amount-cursor-blink mb-[2px] h-[64px] w-1 shrink-0 rounded-[2px] bg-action-primary"
            aria-hidden
          />
        : null}
        <span className="flex shrink-0 items-end text-primary" aria-hidden>
          <span style={payBillEuroSuffixStyle}>€</span>
        </span>
      </span>
    </div>
  )
}
