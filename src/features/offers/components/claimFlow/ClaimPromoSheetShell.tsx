import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { CLAIM_SUCCESS_HERO_SRC } from "@/features/offers/constants/claimFlowHero"
import * as Dialog from "@radix-ui/react-dialog"
import {
  useCallback,
  useEffect,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import {
  SHEET_CLOSE_ICON_ON_SURFACE_CLASS,
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
  SHEET_CLOSE_ON_SURFACE_CLASS,
  SHEET_CLOSE_OVER_MEDIA_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_FOOTER_CLASS,
  VAUL_SHEET_OVERLAY_CLASS,
  VAUL_SHEET_SCROLL_BODY_CLASS,
  vaulSheetContentClassName,
} from "@/shared/utils/vaulAppSheetShell"

export type ClaimPromoSheetHeroVariant = "offer-image" | "success-badge" | "none"

/** `fill` = long forms; `fit` = short content (post-claim success). */
export type ClaimPromoSheetHeight = "fit" | "fill"

export interface ClaimPromoSheetShellProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  container?: HTMLElement | null
  zOverlay?: number
  zContent?: number
  title: string
  description?: string
  /** When set, visible content supplies the dialog title (avoids duplicate sr-only + visible heading). */
  visibleTitleId?: string
  /** When set, visible content supplies the dialog description. */
  visibleDescriptionId?: string
  hero?: ClaimPromoSheetHeroVariant
  heroImageSrc?: string
  /** Applied to hero `<img>` when `hero` is `offer-image` (default `object-cover`). */
  heroImageClassName?: string
  surfaceClass?: "bg-layer-floor-1" | "bg-layer-floor-2"
  sheetHeight?: ClaimPromoSheetHeight
  footer?: ReactNode
  /** When false, footer has no top border (e.g. welcome / at-venue sheets). */
  footerBordered?: boolean
  /** Extra classes on the pinned footer wrapper (e.g. Figma pt/pb on payment sheet). */
  footerClassName?: string
  onContentAnimationEnd?: (e: AnimationEvent<HTMLDivElement>) => void
  children: ReactNode
}

function PromoSheetHero({
  hero,
  heroImageSrc,
  heroImageClassName = "object-cover",
}: {
  hero: ClaimPromoSheetHeroVariant
  heroImageSrc?: string
  heroImageClassName?: string
}) {
  if (hero === "none") return null

  return (
    <div className="relative aspect-[375/250] w-full shrink-0 overflow-hidden">
      <div className="absolute inset-0 bg-positive-secondary" aria-hidden />
      {hero === "success-badge" ?
        <img
          src={CLAIM_SUCCESS_HERO_SRC}
          alt=""
          width={375}
          height={250}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 size-full ${heroImageClassName}`}
        />
      : heroImageSrc ?
        <img
          src={heroImageSrc}
          alt=""
          width={375}
          height={250}
          decoding="async"
          draggable={false}
          className={`absolute inset-0 size-full ${heroImageClassName}`}
        />
      : null}
    </div>
  )
}

export function ClaimPromoSheetShell({
  open,
  onOpenChange,
  container,
  zOverlay = Z_RESTAURANT_SHEET_OVERLAY,
  zContent = Z_RESTAURANT_SHEET_CONTENT,
  title,
  description,
  visibleTitleId,
  visibleDescriptionId,
  hero = "none",
  heroImageSrc,
  heroImageClassName,
  surfaceClass = "bg-layer-floor-2",
  sheetHeight = "fill",
  footer,
  footerBordered = true,
  footerClassName,
  onContentAnimationEnd,
  children,
}: ClaimPromoSheetShellProps) {
  const isFit = sheetHeight === "fit"
  const closeOverHero = hero !== "none"
  const closeButtonClass =
    closeOverHero ? SHEET_CLOSE_OVER_MEDIA_CLASS : SHEET_CLOSE_ON_SURFACE_CLASS
  const closeIconClass =
    closeOverHero ?
      SHEET_CLOSE_ICON_OVER_MEDIA_CLASS
    : SHEET_CLOSE_ICON_ON_SURFACE_CLASS
  const [motionActive, setMotionActive] = useState(open)

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        const active = document.activeElement
        if (active instanceof HTMLElement) active.blur()
      }
      onOpenChange(next)
    },
    [onOpenChange],
  )

  const handleContentAnimationEnd = useCallback(
    (e: AnimationEvent<HTMLDivElement>) => {
      if (e.target !== e.currentTarget) return
      setMotionActive(false)
      onContentAnimationEnd?.(e)
    },
    [onContentAnimationEnd],
  )

  useEffect(() => {
    if (open) setMotionActive(true)
  }, [open])

  return (
    <Drawer.Root
      open={open}
      onOpenChange={handleOpenChange}
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
          className={[
            vaulSheetContentClassName("default", isFit ? "fit" : "fill"),
            surfaceClass,
            "transform-gpu",
            motionActive ? "will-change-transform" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ zIndex: zContent }}
          aria-labelledby={visibleTitleId}
          aria-describedby={visibleDescriptionId}
          onAnimationEnd={handleContentAnimationEnd}
        >
          {visibleTitleId ?
            null
          : <Dialog.Title className="sr-only">{title}</Dialog.Title>}
          {description && !visibleDescriptionId ?
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
          : null}

          <Drawer.Close asChild>
            <button
              type="button"
              className={closeButtonClass}
              aria-label="Close"
            >
              <Cross
                size="xs"
                className={closeIconClass}
                aria-hidden
              />
            </button>
          </Drawer.Close>

          <div
            className={[
              isFit ?
                "touch-pan-y overflow-y-auto overscroll-y-contain max-h-[calc(min(97dvh,var(--app-h,100dvh))-5rem)]"
              : VAUL_SHEET_SCROLL_BODY_CLASS,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <PromoSheetHero
              hero={hero}
              heroImageSrc={heroImageSrc}
              heroImageClassName={heroImageClassName}
            />
            {children}
          </div>

          {footer ?
            <div
              data-snackbar-anchor=""
              className={[
                VAUL_SHEET_FOOTER_CLASS,
                footerBordered ? "" : "border-t-0 pt-4",
                footerClassName,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {footer}
            </div>
          : null}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
