import { Typography } from "@bolteu/kalep-react"
import { useCallback, useId, type AnimationEvent } from "react"
import { formatPeopleCountLabel } from "@/features/offers/components/ClaimOfferModal/formatPeopleCountLabel"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"

export interface GuestPickerSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  value: number
  onChange: (guests: number) => void
  container?: HTMLElement | null
  /** Fires once after the sheet finishes animating closed. */
  onExitComplete?: () => void
}

const OPTIONS = [1, 2, 3, 4, 5, 6] as const

/**
 * Guest count bottom sheet — tap row selects and closes (Figma claim flow).
 * Presented sequentially with the claim modal (not nested).
 */
export function GuestPickerSheet({
  isOpen,
  onOpenChange,
  value,
  onChange,
  container,
  onExitComplete,
}: GuestPickerSheetProps) {
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
      title="How many people?"
      description="Choose how many people will dine."
      visibleTitleId={titleId}
      hero="none"
      sheetHeight="fit"
      surfaceClass="bg-layer-floor-2"
    >
      <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
        <h2 id={titleId} className="m-0 p-0">
          <Typography variant="body-l-accent" color="primary" as="span">
            How many people?
          </Typography>
        </h2>
      </div>
      <ul className="m-0 flex list-none flex-col p-0 pb-[max(1.5rem,var(--safe-area-bottom))]">
        {OPTIONS.map((n, index) => {
          const selected = n === value
          const label = formatPeopleCountLabel(n)
          return (
            <li
              key={n}
              className={`m-0 border-b border-separator p-0 ${index === OPTIONS.length - 1 ? "border-b-0" : ""}`}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer flex-row items-center justify-between border-none bg-transparent px-6 py-4 text-left"
                onClick={() => {
                  onChange(n)
                  onOpenChange(false)
                }}
              >
                <Typography as="span" variant="body-m-regular" color="primary">
                  {label}
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
