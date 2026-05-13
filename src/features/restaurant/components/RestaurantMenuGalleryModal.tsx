import { IconButton, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { Z_RESTAURANT_SHEET_CONTENT } from "@/features/restaurant/constants/screenLayers"
import { useMenuImagePinchZoom } from "@/features/restaurant/hooks/useMenuImagePinchZoom"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface RestaurantMenuGalleryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** Horizontal gallery (large menu photography). */
  imageUrls: readonly string[]
  /** Accessible name for the dialog. */
  ariaLabel?: string
  container?: HTMLElement | null
  /** Slide shown when the modal opens (clamped to the last index). */
  initialSlideIndex?: number
  /** Venue photos use cover; menu pages use contain. */
  imageObjectFit?: "contain" | "cover"
}

function MenuZoomableSlide({
  src,
  alt,
  imageObjectFit = "contain",
  isActive,
}: {
  src: string
  alt: string
  imageObjectFit?: "contain" | "cover"
  isActive: boolean
}) {
  const { wrapRef, scale } = useMenuImagePinchZoom(isActive)

  const imgClass =
    imageObjectFit === "cover"
      ? "h-full w-full min-h-0 object-cover select-none"
      : "max-h-full max-w-full object-contain select-none"

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full cursor-zoom-in items-center justify-center overflow-hidden"
    >
      <img
        src={src}
        alt={alt}
        decoding="async"
        draggable={false}
        className={imgClass}
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      />
    </div>
  )
}

/**
 * Fullscreen menu photo viewer (portaled): Kalep **static** dark surface
 * (`bg-static-key-dark`), horizontal paging, pinch / ctrl-wheel zoom.
 * **GSAP** enter/exit (fade + light scale) for a native-style modal feel.
 */
export function RestaurantMenuGalleryModal({
  isOpen,
  onOpenChange,
  imageUrls,
  ariaLabel = "Restaurant menu",
  container,
  initialSlideIndex = 0,
  imageObjectFit = "contain",
}: RestaurantMenuGalleryModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Array<HTMLDivElement | null>>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const host = container ?? (typeof document !== "undefined" ? document.body : null)

  const close = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useLayoutEffect(() => {
    if (!isOpen) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount before exit tween; keep portal until close animation finishes
    setMounted(true)
  }, [isOpen])

  const visible = isOpen || mounted

  useLayoutEffect(() => {
    if (!isOpen || !scrollRef.current) return
    const last = Math.max(0, imageUrls.length - 1)
    const idx = Math.min(Math.max(0, initialSlideIndex), last)
    const apply = () => {
      const root = scrollRef.current
      const node = slideRefs.current[idx]
      if (!root) return
      if (node) {
        root.scrollLeft = node.offsetLeft
      } else {
        root.scrollLeft = 0
      }
      setActiveIndex(idx)
    }
    apply()
    const id = window.requestAnimationFrame(apply)
    return () => window.cancelAnimationFrame(id)
  }, [isOpen, imageUrls, initialSlideIndex])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible, close])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  const setSlideRef = useCallback((index: number, el: HTMLDivElement | null) => {
    slideRefs.current[index] = el
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    const root = scrollRef.current
    const urls = imageUrls
    if (!root || urls.length === 0) return

    const nodes = urls
      .map((_, i) => slideRefs.current[i])
      .filter((n): n is HTMLDivElement => Boolean(n))
    if (nodes.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        const idx = best?.target.getAttribute("data-slide-index")
        if (idx != null) setActiveIndex(Number.parseInt(idx, 10))
      },
      { root, rootMargin: "0px", threshold: [0.35, 0.5, 0.65] },
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [isOpen, imageUrls])

  useLayoutEffect(() => {
    tlRef.current?.kill()
    tlRef.current = null
    if (!visible) return

    const el = rootRef.current
    if (!el) return

    gsap.killTweensOf(el)
    const reduced = prefersReducedMotion()

    if (isOpen) {
      if (reduced) {
        gsap.set(el, { autoAlpha: 0 })
      } else {
        gsap.set(el, {
          autoAlpha: 0,
          scale: 0.96,
          transformOrigin: "50% 50%",
          force3D: true,
        })
      }

      const tl = gsap.timeline()
      tlRef.current = tl
      if (reduced) {
        tl.to(el, { autoAlpha: 1, duration: 0.14, ease: "none" })
      } else {
        tl.to(el, {
          autoAlpha: 1,
          scale: 1,
          duration: 0.36,
          ease: "power2.out",
        })
      }
      return () => {
        tl.kill()
      }
    }

    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    })
    tlRef.current = tl
    if (reduced) {
      tl.to(el, { autoAlpha: 0, duration: 0.14, ease: "none" })
    } else {
      tl.to(el, {
        autoAlpha: 0,
        scale: 0.98,
        duration: 0.28,
        ease: "power2.in",
      })
    }
    return () => {
      tl.kill()
    }
  }, [visible, isOpen])

  useEffect(() => {
    return () => {
      tlRef.current?.kill()
      const el = rootRef.current
      if (el) gsap.killTweensOf(el)
    }
  }, [])

  if (imageUrls.length === 0 || !host) return null
  if (!visible) return null

  const count = imageUrls.length
  const counter = `${activeIndex + 1} of ${count}`

  return createPortal(
    <div
      ref={rootRef}
      className="pointer-events-auto fixed inset-0 mx-auto flex min-h-0 w-full max-w-[var(--shell-width)] flex-col bg-static-key-dark"
      style={{ zIndex: Z_RESTAURANT_SHEET_CONTENT }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <p className="sr-only">
        Swipe horizontally to browse menu photos. Pinch or ctrl-scroll to zoom.
        Press Escape to close.
      </p>

      <div className="relative flex w-full shrink-0 items-center gap-2.5 pb-3 ps-[14px] pe-16 pt-6">
        <IconButton
          type="button"
          variant="secondary"
          shape="round"
          size="md"
          aria-label="Close menu"
          onClick={close}
          overrideClassName="relative z-[1] size-10 min-h-10 min-w-10 shrink-0 border-0 bg-layer-floor-1 p-0 shadow-[0_0.125rem_0.1875rem_rgba(0,0,0,0.16)]"
          icon={<Cross size="md" className="text-primary" />}
        />
        <div className="flex min-w-0 flex-1 justify-center">
          <Typography
            variant="body-l-accent"
            color="primary-inverted"
            as="span"
            noWrap
          >
            {counter}
          </Typography>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-row items-stretch gap-3 overflow-x-auto overflow-y-hidden px-3 pb-[max(1.5rem,var(--safe-area-bottom))] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {imageUrls.map((src, i) => (
          <div
            key={`${src}-${i}`}
            ref={(el) => {
              setSlideRef(i, el)
            }}
            data-slide-index={i}
            className="flex h-full min-h-0 w-[18.9375rem] max-w-[85vw] shrink-0 snap-center snap-always flex-col"
          >
            <MenuZoomableSlide
              src={src}
              alt={`${ariaLabel} page ${i + 1} of ${count}`}
              imageObjectFit={imageObjectFit}
              isActive={i === activeIndex}
            />
          </div>
        ))}
      </div>

      <div
        className="flex h-[2.125rem] shrink-0 items-start justify-center pb-[max(0.5rem,var(--safe-area-bottom))] pt-1"
        aria-hidden
      >
        <div className="h-[0.3125rem] w-[8.375rem] rounded-full bg-static-key-light/35" />
      </div>
    </div>,
    host,
  )
}
