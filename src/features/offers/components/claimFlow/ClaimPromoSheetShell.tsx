import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import { CLAIM_SUCCESS_HERO_SRC } from "@/features/offers/constants/claimFlowHero"
import { useId, type AnimationEvent, type ReactNode } from "react"
import { Drawer } from "vaul"
import {
  Z_RESTAURANT_SHEET_CONTENT,
  Z_RESTAURANT_SHEET_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import {
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
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
  hero?: ClaimPromoSheetHeroVariant
  heroImageSrc?: string
  surfaceClass?: "bg-layer-floor-1" | "bg-layer-floor-2"
  sheetHeight?: ClaimPromoSheetHeight
  footer?: ReactNode
  /** When false, footer has no top border (e.g. welcome / at-venue sheets). */
  footerBordered?: boolean
  onContentAnimationEnd?: (e: AnimationEvent<HTMLDivElement>) => void
  children: ReactNode
}

function PromoSheetHero({
  hero,
  heroImageSrc,
}: {
  hero: ClaimPromoSheetHeroVariant
  heroImageSrc?: string
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
          className="absolute inset-0 size-full object-cover"
        />
      : heroImageSrc ?
        <img
          src={heroImageSrc}
          alt=""
          width={375}
          height={250}
          decoding="async"
          draggable={false}
          className="absolute inset-0 size-full object-cover"
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
  hero = "none",
  heroImageSrc,
  surfaceClass = "bg-layer-floor-2",
  sheetHeight = "fill",
  footer,
  footerBordered = true,
  onContentAnimationEnd,
  children,
}: ClaimPromoSheetShellProps) {
  const titleId = useId()
  const isFit = sheetHeight === "fit"
  const hasPinnedFooter = footer != null

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
          className={[
            vaulSheetContentClassName("default", hasPinnedFooter ? "fill" : isFit ? "fit" : "fill"),
            surfaceClass,
          ].join(" ")}
          style={{ zIndex: zContent }}
          onAnimationEnd={onContentAnimationEnd}
        >
          <Drawer.Title id={titleId} className="sr-only">
            {title}
          </Drawer.Title>
          {description ?
            <Drawer.Description className="sr-only">
              {description}
            </Drawer.Description>
          : null}

          <Drawer.Close asChild>
            <button
              type="button"
              className={SHEET_CLOSE_OVER_MEDIA_CLASS}
              aria-label="Close"
            >
              <Cross
                size="xs"
                className={SHEET_CLOSE_ICON_OVER_MEDIA_CLASS}
                aria-hidden
              />
            </button>
          </Drawer.Close>

          <div
            className={[
              VAUL_SHEET_SCROLL_BODY_CLASS,
              isFit && !hasPinnedFooter ?
                "max-h-[calc(min(97dvh,var(--app-h,100dvh))-5rem)]"
              : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <PromoSheetHero hero={hero} heroImageSrc={heroImageSrc} />
            {children}
          </div>

          {footer ?
            <div
              data-snackbar-anchor=""
              className={[
                VAUL_SHEET_FOOTER_CLASS,
                footerBordered ? "" : "border-t-0 pt-4",
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
