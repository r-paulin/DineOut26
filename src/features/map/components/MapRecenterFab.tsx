import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import MyLocationIos from "@bolteu/kalep-react-icons/dist/MyLocationIos"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface MapRecenterFabProps {
  visible: boolean
  bottomPx: number
  onClick: () => void
}

/** Figma Consumer Dine-out `[Eater] Icon-Nav-Button` (node 15838:19194) — elevation + My Location icon. */
const ENTER = { duration: 0.34, ease: "back.out(1.25)" } as const
const EXIT = { duration: 0.26, ease: "power2.in" } as const

export function MapRecenterFab({
  visible,
  bottomPx,
  onClick,
}: MapRecenterFabProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const firstPaint = useRef(true)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduce = prefersReducedMotion()
    gsap.killTweensOf(root)

    if (reduce) {
      gsap.set(root, {
        autoAlpha: visible ? 1 : 0,
        scale: 1,
        y: 0,
        pointerEvents: visible ? "auto" : "none",
      })
      firstPaint.current = false
      return () => {
        gsap.killTweensOf(root)
      }
    }

    if (firstPaint.current) {
      firstPaint.current = false
      if (!visible) {
        gsap.set(root, {
          autoAlpha: 0,
          scale: 0.92,
          y: 8,
          pointerEvents: "none",
          transformOrigin: "50% 50%",
        })
        return () => {
          gsap.killTweensOf(root)
        }
      }
      gsap.set(root, {
        pointerEvents: "auto",
        autoAlpha: 0,
        scale: 0.86,
        y: 12,
        transformOrigin: "50% 50%",
      })
      gsap.to(root, {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        ...ENTER,
      })
      return () => {
        gsap.killTweensOf(root)
      }
    }

    if (visible) {
      gsap.set(root, { pointerEvents: "auto" })
      gsap.fromTo(
        root,
        {
          autoAlpha: 0,
          scale: 0.86,
          y: 12,
          transformOrigin: "50% 50%",
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          ...ENTER,
        },
      )
    } else {
      gsap.to(root, {
        autoAlpha: 0,
        scale: 0.9,
        y: 10,
        transformOrigin: "50% 50%",
        ...EXIT,
        onComplete: () => {
          gsap.set(root, { pointerEvents: "none" })
        },
      })
    }

    return () => {
      gsap.killTweensOf(root)
    }
  }, [visible])

  return (
    <div
      ref={rootRef}
      className="fixed right-4 z-[40]"
      style={{ bottom: `${bottomPx}px` }}
    >
      <button
        type="button"
        className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-solid border-separator bg-layer-floor-1 p-0 text-primary shadow-[0_2px_6px_rgba(0,0,0,0.16)] outline-none transition-none"
        aria-label="Re-center map on your location"
        tabIndex={visible ? 0 : -1}
        onClick={onClick}
      >
        <MyLocationIos size="md" aria-hidden />
      </button>
    </div>
  )
}
