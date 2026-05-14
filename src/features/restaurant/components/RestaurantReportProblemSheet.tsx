import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useEffect, useId, useState } from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { useSnackbar } from "@/shared/snackbar"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export const RESTAURANT_REPORT_PROBLEM_REASONS = [
  {
    id: "dineout-not-offered",
    label: "DineOut payment is not offered here",
  },
  {
    id: "no-table",
    label: "I could not get a table",
  },
  {
    id: "discount-not-applied",
    label: "My DineOut discount was not applied",
  },
  {
    id: "bill-wrong",
    label: "The bill or total looked wrong",
  },
  {
    id: "other",
    label: "Something else about DineOut",
  },
] as const

export type RestaurantReportProblemReasonId =
  (typeof RESTAURANT_REPORT_PROBLEM_REASONS)[number]["id"]

export interface RestaurantReportProblemSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  container?: HTMLElement | null
  /** Optional hook for analytics / future API. */
  onReport?: (reasonId: RestaurantReportProblemReasonId) => void
}

/**
 * Prototype: user picks a DineOut-related reason and taps Submit — snackbar + dismiss.
 */
export function RestaurantReportProblemSheet({
  isOpen,
  onOpenChange,
  container,
  onReport,
}: RestaurantReportProblemSheetProps) {
  const titleId = useId()
  const snackbar = useSnackbar()
  const [selectedId, setSelectedId] =
    useState<RestaurantReportProblemReasonId | null>(null)

  useEffect(() => {
    if (!isOpen) setSelectedId(null)
  }, [isOpen])

  const handleSubmit = () => {
    if (!selectedId) return
    onReport?.(selectedId)
    snackbar.add({
      description:
        "Thanks — we have received your report and will look into it.",
      timeout: 4500,
    })
    onOpenChange(false)
  }

  return (
    <Drawer.Root
      open={isOpen}
      onOpenChange={onOpenChange}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={VAUL_SHEET_OVERLAY_CLASS}
          style={{ zIndex: Z_RESTAURANT_SHEET_OVERLAY }}
        />
        <Drawer.Content
          className={vaulSheetContentClassName()}
          style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
        >
          <Drawer.Title className="sr-only">Report a problem</Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_ON_SURFACE_NESTED_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div className="flex max-h-[min(32rem,85vh)] flex-col pb-[max(1rem,var(--safe-area-bottom))]">
            <Drawer.Description className="sr-only">
              Choose the option that best describes the issue, then submit.
            </Drawer.Description>
            <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
              <h2 id={titleId} className="m-0 p-0">
                <Typography variant="heading-m-accent" color="primary" as="span">
                  Report a problem
                </Typography>
              </h2>
              <Typography variant="body-s-regular" color="secondary" as="p">
                Tell us what went wrong so we can improve DineOut.
              </Typography>
            </div>
            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 pb-4"
              role="radiogroup"
              aria-labelledby={titleId}
            >
              <div className="flex flex-col gap-2">
                {RESTAURANT_REPORT_PROBLEM_REASONS.map((r) => {
                  const selected = selectedId === r.id
                  return (
                    <button
                      key={r.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`flex w-full cursor-pointer rounded-xl border border-solid px-4 py-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-action-primary ${
                        selected
                          ? "border-action-primary bg-active-neutral-secondary"
                          : "border-separator bg-transparent"
                      }`}
                      onClick={() => {
                        setSelectedId(r.id)
                      }}
                    >
                      <Typography variant="body-m-regular" color="primary" as="span">
                        {r.label}
                      </Typography>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="shrink-0 border-t border-solid border-separator px-6 pt-4">
              <Button
                type="button"
                variant="primary"
                fullWidth
                disabled={!selectedId}
                onClick={handleSubmit}
                overrideClassName="!h-12 rounded-full"
              >
                Submit
              </Button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
