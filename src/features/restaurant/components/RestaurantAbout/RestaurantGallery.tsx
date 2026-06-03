import { Typography } from "@bolteu/kalep-react"

const R12 = "rounded-[12px]"
const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"
const GALLERY_H = 271
/** Figma About / Venue side column width. */
const SIDE_COL_W = 130

/** Same bleed pattern as {@link OfferCardListGallery}: no `w-full` so `-mx-6` widens the row. */
const SCROLL_ROW =
  "flex flex-row gap-3 overflow-x-auto overflow-y-hidden pb-0 -mx-6 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden touch-pan-x [overscroll-behavior-x:contain]"

/** Scrolls away on swipe so the mosaic can go edge-to-edge after the first snap. */
const LEADING_INSET = "1.5rem"

export interface RestaurantGalleryProps {
  images: readonly string[]
  onSelectIndex: (index: number) => void
  onMorePress: () => void
}

function StackImage({
  src,
  onPress,
}: {
  src: string
  onPress: () => void
}) {
  return (
    <button
      type="button"
      className={`relative min-h-0 flex-1 overflow-hidden ${R12} w-full cursor-pointer border-none bg-neutral-secondary p-0`}
      onClick={onPress}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className={`absolute inset-0 size-full object-cover ${R12}`}
      />
    </button>
  )
}

/**
 * Horizontal snap mosaic: full-width hero + stack (first screen), tail column (peek).
 * Expects at least four image URLs (indices 0–3 shown; “More…” opens full gallery).
 */
export function RestaurantGallery({
  images,
  onSelectIndex,
  onMorePress,
}: RestaurantGalleryProps) {
  const a = images[0]
  const b = images[1]
  const c = images[2]
  const d = images[3]
  if (!a || !b || !c || !d) {
    return (
      <div
        className="flex w-full shrink-0 items-center justify-center rounded-[12px] bg-neutral-secondary px-6"
        style={{ height: `${GALLERY_H}px` }}
        role="status"
        aria-label="Photo gallery unavailable"
      >
        <Typography variant="body-s-regular" color="secondary" as="p">
          Photos unavailable
        </Typography>
      </div>
    )
  }

  return (
    <div className={SCROLL_ROW} style={{ height: `${GALLERY_H}px` }}>
      <div className="w-6 shrink-0 snap-none" aria-hidden />
      <div
        className="flex shrink-0 snap-start snap-always gap-3"
        style={{
          height: GALLERY_H,
          width: `calc(100% - ${LEADING_INSET})`,
          minWidth: `calc(100% - ${LEADING_INSET})`,
        }}
      >
        <button
          type="button"
          className={`relative min-h-0 min-w-0 flex-1 overflow-hidden ${R12} cursor-pointer border-none bg-neutral-secondary p-0`}
          style={{ height: GALLERY_H }}
          onClick={() => {
            onSelectIndex(0)
          }}
        >
          <img
            src={a}
            alt=""
            loading="lazy"
            className={`absolute inset-0 size-full object-cover ${R12}`}
          />
          <div
            className={`pointer-events-none absolute inset-0 ${R12}`}
            style={{ background: IMAGE_GRAD }}
          />
        </button>

        <div
          className="flex shrink-0 flex-col gap-3"
          style={{ width: SIDE_COL_W, height: GALLERY_H }}
        >
          <StackImage src={b} onPress={() => onSelectIndex(1)} />
          <StackImage src={c} onPress={() => onSelectIndex(2)} />
        </div>
      </div>

      <div
        className="flex shrink-0 snap-start snap-always flex-col gap-3"
        style={{ width: SIDE_COL_W, height: GALLERY_H }}
      >
        <StackImage src={d} onPress={() => onSelectIndex(3)} />
        <button
          type="button"
          className={`flex min-h-0 flex-1 cursor-pointer flex-col items-center justify-center border-none ${R12} bg-neutral-secondary px-4 py-4`}
          onClick={onMorePress}
        >
          <Typography
            variant="body-s-accent"
            color="primary"
            align="center"
            as="span"
          >
            More...
          </Typography>
        </button>
      </div>
    </div>
  )
}
