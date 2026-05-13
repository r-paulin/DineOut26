import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { Drawer } from "vaul"
import type { CSSProperties } from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { BillAmountEntryBlock } from "@/features/payBill/components/shared/BillAmountEntryBlock"
import { useAnimatedBillCents } from "@/features/payBill/hooks/useAnimatedBillCents"
import {
  billNumpadStateFromCents,
  billStateFromFormattedInput,
  billStateToCents,
  formatBillDisplayEur,
  initialBillNumpadState,
  isBillAmountValidForContinue,
} from "@/features/payBill/utils/billAmount"
import { useVisualViewportKeyboardBottomInset } from "@/shared/hooks/useVisualViewportKeyboardBottomInset"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"

export interface CustomTipModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialCents: number
  container?: HTMLElement | null
  onSave: (amountEur: number) => void
}

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/**
 * Bottom sheet: custom tip — native decimal keyboard via transparent input (same
 * pattern as {@link BillAmountScreen}). No in-app numpad so mobile only shows the
 * system keyboard. Sheet `bottom` tracks {@link useVisualViewportKeyboardBottomInset}
 * so Save stays above the keyboard.
 *
 * `modal={false}` so Radix does not mount the overlay `RemoveScroll` path (avoids body
 * scroll-lock / layout shift on the tip screen). A plain scrim restores dimming.
 */
export function CustomTipModal({
  open,
  onOpenChange,
  initialCents,
  container,
  onSave,
}: CustomTipModalProps) {
  const [state, setState] = useState(initialBillNumpadState)
  const amountRef = useRef<HTMLSpanElement>(null)
  const scaleWrapRef = useRef<HTMLSpanElement>(null)
  const hiddenInputRef = useRef<HTMLInputElement>(null)
  const keyboardBottomPx = useVisualViewportKeyboardBottomInset()
  const sheetLifted = keyboardBottomPx > 48

  const cents = billStateToCents(state)
  useAnimatedBillCents(state, amountRef, scaleWrapRef)
  const display = formatBillDisplayEur(state, { dimWhenZero: true })

  useEffect(() => {
    if (!open) return
    setState(billNumpadStateFromCents(initialCents))
  }, [open, initialCents])

  /** Native keyboard after portal paint (`autoFocus` alone is unreliable in drawers). */
  useLayoutEffect(() => {
    if (!open) return
    const id = window.requestAnimationFrame(() => {
      hiddenInputRef.current?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [open])

  const valid = isBillAmountValidForContinue(state)

  const drawerStyle: CSSProperties = {
    bottom: keyboardBottomPx,
    ...(sheetLifted ?
      {
        maxHeight: `min(90dvh, calc(100svh - ${keyboardBottomPx}px - 0.75rem))`,
      }
    : {}),
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible
      modal={false}
      repositionInputs={false}
      snapPoints={[]}
    >
      <Drawer.Portal container={container ?? undefined}>
        <div
          role="presentation"
          className="fixed inset-0 z-[200] bg-special-scrim"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) onOpenChange(false)
          }}
        />
        <Drawer.Content
          className={[
            "fixed inset-x-0 z-[201] flex flex-col rounded-t-[16px] bg-layer-floor-1 px-0 pb-0 outline-none",
            "overflow-hidden shadow-[0_0.375rem_0.75rem_rgba(0,0,0,0.24)]",
            sheetLifted ? "min-h-0" : "min-h-[70dvh] max-h-[min(90dvh,100svh)]",
          ].join(" ")}
          style={drawerStyle}
        >
          <Drawer.Title className="sr-only">Add a custom tip</Drawer.Title>
          <Drawer.Description className="sr-only">
            Enter a custom tip amount with the keyboard, then save.
          </Drawer.Description>

          <div className="relative shrink-0 px-6 pb-3 pt-6">
            <Drawer.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className={`${SHEET_CLOSE_ON_SURFACE_NESTED_CLASS} !right-3 !top-3 z-[2] !size-7`}
              >
                <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
              </button>
            </Drawer.Close>
            <div className="w-full px-10 text-center">
              <Typography
                variant="body-l-accent"
                color="primary"
                align="center"
                as="h2"
                inlineStyle={{
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                  fontFeatureSettings: FONT_FEAT,
                }}
              >
                Add a custom tip
              </Typography>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto outline-none">
            <BillAmountEntryBlock
              label="Tip amount"
              coarse
              display={display}
              amountRef={amountRef}
              scaleWrapRef={scaleWrapRef}
              hiddenInputRef={hiddenInputRef}
              sectionClassName="relative flex flex-col items-center px-6 pt-[clamp(1.5rem,8vh,96px)] pb-4"
              onTapAmount={() => {
                hiddenInputRef.current?.focus()
              }}
              onHiddenInputChange={(raw) => {
                setState(billStateFromFormattedInput(raw))
              }}
              inputName="customTipAmount"
              inputAriaLabel="Custom tip amount"
            />
          </div>

          <div className="flex shrink-0 flex-col px-6 pt-2 pb-[max(1.5rem,var(--safe-area-bottom))]">
            <Button
              variant="primary"
              fullWidth
              disabled={!valid}
              onClick={() => {
                onSave(cents / 100)
                onOpenChange(false)
              }}
              overrideClassName="!min-h-[68px] h-[68px] rounded-full"
            >
              Save
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
