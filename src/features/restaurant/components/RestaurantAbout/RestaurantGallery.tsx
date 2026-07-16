import { Typography } from "@bolteu/kalep-react"

const R12 = "rounded-[12px]"
const IMAGE_GRAD =
  "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)"

/** Figma `19444:49649` About / Images — Place / Gallery. */
const GALLERY_H = 271
const W_HERO = 271
const W_COL = 158

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
 * About header gallery — Figma `19444:48939`:
 * 271×271 hero + 158px stack, gap 12, horizontal scroll + More…
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
  if (!a || !b || !c) {
    return (
      <div
        className="flex w-full shrink-0 items-center justify-center rounded-[12px] bg-neutral-secondary"
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
    <div
      className="flex gap-3 overflow-x-auto overflow-y-hidden pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x [overscroll-behavior-x:contain]"
      style={{ height: `${GALLERY_H}px` }}
    >
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
          aria-hidden
        />
      </button>

      <div
        className="flex shrink-0 flex-col gap-3"
        style={{ width: W_COL, height: GALLERY_H }}
      >
        <StackImage src={b} onPress={() => onSelectIndex(1)} />
        <StackImage src={c} onPress={() => onSelectIndex(2)} />
      </div>

      {d ?
        <>
          <div
            className={`relative shrink-0 overflow-hidden ${R12}`}
            style={{ width: W_HERO, height: GALLERY_H }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-pointer border-none bg-transparent p-0"
              onClick={() => {
                onSelectIndex(3)
              }}
              aria-label="Photo 4"
            >
              <img
                src={d}
                alt=""
                loading="lazy"
                className={`absolute inset-0 size-full object-cover ${R12}`}
              />
            </button>
          </div>
          <div
            className="flex shrink-0 flex-col gap-3"
            style={{ width: W_COL, height: GALLERY_H }}
          >
            {images[4] ?
              <StackImage src={images[4]} onPress={() => onSelectIndex(4)} />
            : null}
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
                More…
              </Typography>
            </button>
          </div>
        </>
      : null}
    </div>
  )
}
