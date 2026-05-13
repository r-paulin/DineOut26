import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { useId } from "react"
import { Drawer } from "vaul"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ON_SURFACE_NESTED_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_OVERLAY_CLASS,
  vaulSheetContentClassName,
  type VaulSheetMaxHeightVariant,
} from "@/shared/utils/vaulAppSheetShell"

export interface AppInfoBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  container?: HTMLElement | null
  title: string
  body: string
  /** Screen reader description; defaults to `body`. */
  description?: string
  zOverlay: number
  zContent: number
  maxHeight?: VaulSheetMaxHeightVariant
}

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

/**
 * Short copy bottom sheet — same shell as rating / opening hours (Vaul + close + heading-m).
 */
export function AppInfoBottomSheet({
  open,
  onOpenChange,
  container,
  title,
  body,
  description,
  zOverlay,
  zContent,
  maxHeight = "default",
}: AppInfoBottomSheetProps) {
  const titleId = useId()

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      dismissible
      repositionInputs={false}
      snapPoints={[]}
      container={container ?? undefined}
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className={VAUL_SHEET_OVERLAY_CLASS}
          style={{ zIndex: zOverlay }}
        />
        <Drawer.Content
          className={vaulSheetContentClassName(maxHeight)}
          style={{ zIndex: zContent }}
        >
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_ON_SURFACE_NESTED_CLASS}
              aria-label="Close"
            >
              <Cross size="xs" className={SHEET_CLOSE_ICON_ON_SURFACE_CLASS} aria-hidden />
            </button>
          </Drawer.Close>
          <div
            className="flex flex-col pb-[max(2rem,var(--safe-area-bottom))]"
          >
            <Drawer.Description className="sr-only">
              {description ?? body}
            </Drawer.Description>
            <div className="flex w-full flex-col gap-2 px-6 pb-3 pt-6 pe-14">
              <h2 id={titleId} className="m-0 p-0">
                <Typography variant="heading-m-accent" color="primary" as="span">
                  {title}
                </Typography>
              </h2>
              <Typography
                variant="body-s-regular"
                color="secondary"
                as="p"
                inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
              >
                {body}
              </Typography>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
