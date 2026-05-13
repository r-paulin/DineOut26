import { Typography } from "@bolteu/kalep-react"

const R12 = "rounded-[12px]"
const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"
const GALLERY_H = 271
const W_HERO = 271
const W_COL = 158

const SCROLL_ROW =
  "flex min-w-0 w-full flex-row gap-3 overflow-x-auto overflow-y-hidden [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden touch-pan-x [overscroll-behavior-x:contain]"

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
 * Horizontal snap mosaic: hero + stack (first screen), tail column (peek).
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
      <div className="flex shrink-0 snap-start gap-3">
        <button
          type="button"
          className={`relative shrink-0 overflow-hidden ${R12} cursor-pointer border-none bg-neutral-secondary p-0`}
          style={{ width: W_HERO, height: GALLERY_H }}
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
          style={{ width: W_COL, height: GALLERY_H }}
        >
          <StackImage src={b} onPress={() => onSelectIndex(1)} />
          <StackImage src={c} onPress={() => onSelectIndex(2)} />
        </div>
      </div>

      <div
        className="flex shrink-0 snap-start flex-col gap-3"
        style={{ width: W_COL, height: GALLERY_H }}
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
