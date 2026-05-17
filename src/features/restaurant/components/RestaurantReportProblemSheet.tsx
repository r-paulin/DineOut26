import { Button, List, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useCallback, useEffect, useId, useState } from "react"
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
    label: "DineOut payment isn't available here",
  },
  {
    id: "no-table",
    label: "I couldn't get a table",
  },
  {
    id: "discount-not-applied",
    label: "My DineOut discount wasn't applied",
  },
  {
    id: "bill-wrong",
    label: "The bill or total didn't look right",
  },
  {
    id: "code-or-app-issue",
    label: "I had trouble with the app or payment code",
  },
  {
    id: "staff-unaware",
    label: "Staff didn't know how DineOut works",
  },
  {
    id: "other",
    label: "Something else about my visit",
  },
] as const

export type RestaurantReportProblemReasonId =
  (typeof RESTAURANT_REPORT_PROBLEM_REASONS)[number]["id"]

export interface RestaurantReportProblemSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  container?: HTMLElement | null
  /** Optional hook for analytics / future API. */
  onReport?: (reasonIds: readonly RestaurantReportProblemReasonId[]) => void
}

/**
 * Report-a-problem bottom sheet — same Vaul shell as {@link RestaurantOpenHoursSheet}
 * (h-fit, 16px radius). Checkbox list uses 24px horizontal inset; all reasons visible
 * without an inner scroll region.
 */
export function RestaurantReportProblemSheet({
  isOpen,
  onOpenChange,
  container,
  onReport,
}: RestaurantReportProblemSheetProps) {
  const titleId = useId()
  const snackbar = useSnackbar()
  const [selectedIds, setSelectedIds] = useState<
    Set<RestaurantReportProblemReasonId>
  >(() => new Set())

  useEffect(() => {
    if (!isOpen) setSelectedIds(new Set())
  }, [isOpen])

  const toggleReason = useCallback((id: RestaurantReportProblemReasonId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const canSubmit = selectedIds.size > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    onReport?.([...selectedIds])
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
          <div className="flex flex-col pb-[max(2rem,var(--safe-area-bottom))]">
            <Drawer.Description className="sr-only">
              Select all options that apply, then submit.
            </Drawer.Description>
            <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
              <h2 id={titleId} className="m-0 p-0">
                <Typography variant="heading-m-accent" color="primary" as="span">
                  Report a problem
                </Typography>
              </h2>
              <Typography variant="body-s-regular" color="secondary" as="p">
                Tell us what went wrong. Select all that apply so we can improve
                DineOut.
              </Typography>
            </div>
            <div className="w-full px-6">
              <List.Root role="group" aria-labelledby={titleId}>
                {RESTAURANT_REPORT_PROBLEM_REASONS.map((r, index) => (
                  <List.Item
                    key={r.id}
                    primary={r.label}
                    selected={selectedIds.has(r.id)}
                    selectionMode="multiple"
                    separator={
                      index < RESTAURANT_REPORT_PROBLEM_REASONS.length - 1
                    }
                    paddingStart={0}
                    paddingEnd={0}
                    onClick={() => {
                      toggleReason(r.id)
                    }}
                    aria-label={r.label}
                  />
                ))}
              </List.Root>
            </div>
            <div
              data-snackbar-anchor=""
              className="shrink-0 border-t border-solid border-separator px-6 pt-4"
            >
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canSubmit}
                onClick={handleSubmit}
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
