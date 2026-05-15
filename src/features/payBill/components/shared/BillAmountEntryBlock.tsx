import { Typography } from "@bolteu/kalep-react"
import type { RefObject } from "react"
import { BillAmountDisplayRow } from "@/features/payBill/components/shared/BillAmountDisplayRow"

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

/**
 * Custom tip amount field — label chrome + shared {@link BillAmountDisplayRow}.
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
  return (
    <div className={sectionClassName}>
      <Typography variant="body-s-regular" color="secondary" as="p">
        {label}
      </Typography>
      <div className="mt-3 w-full max-w-[min(100%,22rem)]">
        <BillAmountDisplayRow
          display={display}
          amountRef={amountRef}
          scaleWrapRef={scaleWrapRef}
          hiddenInputRef={hiddenInputRef}
          onHiddenInputChange={onHiddenInputChange}
          inputName={inputName}
          inputAriaLabel={inputAriaLabel}
          nativeInput={coarse}
          autoFocusInput={coarse}
          selectAllOnFirstFocus={coarse}
          onTap={onTapAmount}
        />
      </div>
    </div>
  )
}
