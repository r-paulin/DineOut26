import type { OfferCardCampaign } from "@/features/offers/offers.types"
import { Typography } from "@bolteu/kalep-react"
import { OfferCardBadges } from "./OfferCardBadges"

export interface OfferCardListGalleryProps {
  /** Up to 6 photos; order matches Figma `_Place / Card / XL` → `Place / Gallery`. */
  photos: string[]
  campaign: OfferCardCampaign
}

const R12 = "rounded-[12px]"

const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"

const GALLERY_H = 271
const W_HERO = 271
const W_COL = 158
const MAX_PHOTOS = 6

/**
 * Same horizontal scroll row as sheet offer carousels (`BottomSheetScrollContent`).
 * Intentionally NO `w-full` / `min-w-0`: an explicit width on a flex item makes
 * `-mx-6` only shift the box (not enlarge it), so the right side gets clipped at
 * the card boundary. Without an explicit width, flex cross-axis stretch + the
 * negative margins enlarge the row to span past the card padding — matching the
 * 62px stack peek in Figma `Place / Gallery` (node `15735:22006`).
 */
const SHEET_CAROUSEL_SCROLL_ROW =
  "flex gap-3 overflow-x-auto overflow-y-visible pb-0 -mx-6 px-6 [scroll-snap-type:x_proximity] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x [overscroll-behavior-x:contain]"

/**
 * Figma `Place / Gallery` (node `15735:22006`): horizontal strip, `gap` 12px,
 * height 271px — hero 271×271, 158-wide stacks, optional 271 large + tail column
 * with fifth image and/or “More…”. One scroll row (same pattern as carousel strips).
 */
export function OfferCardListGallery({
  photos,
  campaign,
}: OfferCardListGalleryProps) {
  const list = photos.slice(0, MAX_PHOTOS)
  const src = (i: number) => list[i]

  if (!src(0)) {
    return null
  }

  const showStack = list.length >= 2
  const showLarge = list.length >= 4 && !!src(3)
  /** Tail column only when there is a 5th photo or a 6th / “More…” slot — not for exactly 4 images (avoids empty strip on the right). */
  const showTail = list.length >= 5

  return (
    <div
      className={SHEET_CAROUSEL_SCROLL_ROW}
      style={{ height: `${GALLERY_H}px` }}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${R12}`}
        style={{ width: W_HERO, height: GALLERY_H }}
      >
        <img
          src={src(0)}
          alt=""
          loading="lazy"
          className={`absolute inset-0 size-full object-cover ${R12}`}
        />
        <div
          className={`pointer-events-none absolute inset-0 ${R12}`}
          style={{ background: IMAGE_GRAD }}
        />
        <div className="absolute left-3 top-3 flex max-w-[90%] flex-col items-start">
          <OfferCardBadges campaign={campaign} />
        </div>
      </div>

      {showStack ? (
        <div
          className="flex shrink-0 flex-col gap-3"
          style={{ width: W_COL, height: GALLERY_H }}
        >
          {src(2) ? (
            <>
              <GalleryStackImage src={src(1)} />
              <GalleryStackImage src={src(2)} />
            </>
          ) : src(1) ? (
            <GalleryStackImage src={src(1)} fillColumn />
          ) : null}
        </div>
      ) : null}

      {showLarge ? (
        <div
          className={`relative shrink-0 overflow-hidden ${R12}`}
          style={{ width: W_HERO, height: GALLERY_H }}
        >
          <img
            src={src(3)!}
            alt=""
            loading="lazy"
            className={`absolute inset-0 size-full object-cover ${R12}`}
          />
        </div>
      ) : null}

      {showTail ? (
        <div
          className="flex shrink-0 flex-col gap-3"
          style={{ width: W_COL, height: GALLERY_H }}
        >
          {src(4) ? <GalleryStackImage src={src(4)} /> : null}
          {src(5) ? (
            <div
              className={`relative min-h-0 flex-1 overflow-hidden ${R12}`}
            >
              <img
                src={src(5)}
                alt=""
                loading="lazy"
                className={`absolute inset-0 size-full object-cover ${R12}`}
              />
            </div>
          ) : (
            <div
              className={`flex min-h-0 flex-1 flex-col items-center justify-center ${R12} bg-neutral-secondary px-4 py-4`}
            >
              <Typography
                variant="body-s-accent"
                color="primary"
                align="center"
                as="span"
              >
                More…
              </Typography>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function GalleryStackImage({
  src,
  fillColumn,
}: {
  src: string
  fillColumn?: boolean
}) {
  return (
    <div
      className={`relative min-h-0 overflow-hidden ${R12} ${
        fillColumn ? "h-full flex-1" : "flex-1"
      }`}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`absolute inset-0 size-full object-cover ${R12}`}
      />
    </div>
  )
}
