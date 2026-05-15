import { Typography } from "@bolteu/kalep-react"
import type { RefObject } from "react"
import { BillAmountDisplayRow } from "@/features/payBill/components/shared/BillAmountDisplayRow"

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
  onHiddenInputChange: (raw: string) => void
  inputName: string
  inputAriaLabel: string
}

/** Bill amount field — title chrome lives in parent; error row below shared display. */
export function ReceiptAmountBlock({
  errorMessage,
  errorMotionRef,
  errorId,
  autoFocusInput,
  display,
  amountRef,
  scaleWrapRef,
  hiddenInputRef,
  onHiddenInputChange,
  inputName,
  inputAriaLabel,
}: ReceiptAmountBlockProps) {
  return (
    <div className="flex w-full max-w-[min(100%,22rem)] flex-col items-center px-6">
      <BillAmountDisplayRow
        display={display}
        amountRef={amountRef}
        scaleWrapRef={scaleWrapRef}
        hiddenInputRef={hiddenInputRef}
        onHiddenInputChange={onHiddenInputChange}
        inputName={inputName}
        inputAriaLabel={inputAriaLabel}
        autoFocusInput={autoFocusInput}
        selectAllOnFirstFocus
        ariaInvalid={Boolean(errorMessage)}
        ariaDescribedBy={errorMessage && errorId ? errorId : undefined}
      />

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
