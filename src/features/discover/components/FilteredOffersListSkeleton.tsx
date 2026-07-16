import type { CSSProperties } from "react"

/**
 * Figma `19444:55994` — XL list skeleton while filtered results load.
 * Motion follows iOS skeleton guidance: 1.5s linear shimmer, subtle highlight,
 * layout matching `_Place / Card / XL` gallery; Reduce Motion = static bones.
 */

const GALLERY_H = 271
const W_HERO = 271
const W_COL = 158

function Bone({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}) {
  return (
    <div
      className={["skeleton-bone", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden
    />
  )
}

function SkeletonCard() {
  return (
    <div className="flex w-full flex-col gap-2 pb-6">
      <div
        className="flex gap-3 overflow-hidden pb-0 -mx-6 px-6"
        style={{ height: GALLERY_H }}
        aria-hidden
      >
        <Bone
          className="shrink-0 rounded-[12px]"
          style={{ width: W_HERO, height: GALLERY_H }}
        />
        <div
          className="flex shrink-0 flex-col gap-3"
          style={{ width: W_COL, height: GALLERY_H }}
        >
          <Bone className="min-h-0 flex-1 rounded-[12px]" />
          <Bone className="min-h-0 flex-1 rounded-[12px]" />
        </div>
      </div>
      <Bone className="h-[1.875rem] w-[42%] rounded-md" />
      <Bone className="mt-0.5 h-5 w-[72%] rounded-md" />
      <Bone className="h-5 w-[58%] rounded-md" />
    </div>
  )
}

export function FilteredOffersListSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      className="skeleton-enter flex w-full flex-col pt-3"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading venues"
    >
      <div className="mb-4 flex w-full items-start justify-between gap-3">
        <Bone className="h-9 w-40 rounded-md" />
        <Bone className="mt-2 h-5 w-12 rounded-md" />
      </div>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
