import { Typography } from "@bolteu/kalep-react"
import { useCallback, useId, type AnimationEvent } from "react"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"

export interface TimeSlotSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  slots: string[]
  value: string
  onChange: (time: string) => void
  container?: HTMLElement | null
  /** Fires once after the sheet finishes animating closed. */
  onExitComplete?: () => void
}

/**
 * 15-minute arrival slot picker (limited-window offers).
 * Presented sequentially with the claim modal (not nested).
 */
export function TimeSlotSheet({
  isOpen,
  onOpenChange,
  slots,
  value,
  onChange,
  container,
  onExitComplete,
}: TimeSlotSheetProps) {
  const titleId = useId()

  const handleContentAnimationEnd = useCallback(
    (e: AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      if (!isOpen) onExitComplete?.()
    },
    [isOpen, onExitComplete],
  )

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      onContentAnimationEnd={handleContentAnimationEnd}
      container={container}
      zOverlay={Z_CLAIM_MODAL_OVERLAY}
      zContent={Z_CLAIM_MODAL_CONTENT}
      title="Select arrival time"
      description="Choose your arrival time within the offer window."
      visibleTitleId={titleId}
      hero="none"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-2"
    >
      <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
        <h2 id={titleId} className="m-0 p-0">
          <Typography variant="body-l-accent" color="primary" as="span">
            Select arrival time
          </Typography>
        </h2>
      </div>
      <ul className="m-0 flex max-h-[calc(85vh-4rem)] list-none flex-col overflow-y-auto overscroll-y-contain p-0 pb-[max(1.5rem,var(--safe-area-bottom))]">
        {slots.map((slot, index) => {
          const selected = slot === value
          return (
            <li
              key={slot}
              className={`m-0 border-b border-separator p-0 ${index === slots.length - 1 ? "border-b-0" : ""}`}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer flex-row items-center justify-between border-none bg-transparent px-6 py-4 text-left"
                onClick={() => {
                  onChange(slot)
                  onOpenChange(false)
                }}
              >
                <Typography as="span" variant="body-m-regular" color="primary">
                  {slot}
                </Typography>
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ?
                      "border-special-brand bg-special-brand"
                    : "border-separator bg-transparent"
                  }`}
                  aria-hidden
                >
                  {selected ?
                    <span className="size-2 rounded-full bg-static-key-light" />
                  : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </ClaimPromoSheetShell>
  )
}