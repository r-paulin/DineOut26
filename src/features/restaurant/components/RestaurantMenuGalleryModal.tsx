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
import {
  EASE_STANDARD_IN,
  EASE_STANDARD_OUT,
  MOTION_REDUCED_S,
  MOTION_SHEET_DISMISS_S,
  MOTION_SHEET_S,
} from "@/shared/motion"
import { useModalOverlayLock } from "@/shared/hooks/useModalOverlayLock"
import { motionReduced } from "@/shared/motion/motionHelpers"

export interface RestaurantMenuGalleryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  imageUrls: readonly string[]
  /** Accessible name for the dialog. */
  ariaLabel?: string
  container?: HTMLElement | null
  /** Slide shown when the modal opens (clamped to the last index). */
  initialSlideIndex?: number
  /** Venue photos use cover; menu pages use contain. */
  imageObjectFit?: "contain" | "cover"
  /** Figma `16643:34904` vertical menu stack vs horizontal venue photos. */
  layout?: "horizontal" | "vertical"
}

const VERTICAL_CLOSE_BTN =
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-primary-inverted outline-none ring-inset ring-action-primary focus-visible:ring-2"

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
 * Fullscreen photo viewer (portaled): Kalep **static** dark surface.
 * **horizontal** — venue photos with paging, counter, pinch zoom.
 * **vertical** — menu pages (Figma RESTAURANT / Menu), close-only nav.
 */
export function RestaurantMenuGalleryModal({
  isOpen,
  onOpenChange,
  imageUrls,
  ariaLabel = "Restaurant menu",
  container,
  initialSlideIndex = 0,
  imageObjectFit = "contain",
  layout = "horizontal",
}: RestaurantMenuGalleryModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<Array<HTMLDivElement | null>>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const isVertical = layout === "vertical"
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

  useModalOverlayLock({
    active: visible,
    containerRef: rootRef,
    onEscape: close,
  })

  useLayoutEffect(() => {
    if (!isOpen || !scrollRef.current) return
    const last = Math.max(0, imageUrls.length - 1)
    const idx = Math.min(Math.max(0, initialSlideIndex), last)
    const apply = () => {
      const root = scrollRef.current
      const node = slideRefs.current[idx]
      if (!root) return
      if (node) {
        if (isVertical) {
          root.scrollTop = node.offsetTop
        } else {
          root.scrollLeft = node.offsetLeft
        }
      } else if (isVertical) {
        root.scrollTop = 0
      } else {
        root.scrollLeft = 0
      }
      setActiveIndex(idx)
    }
    apply()
    const id = window.requestAnimationFrame(apply)
    return () => window.cancelAnimationFrame(id)
  }, [isOpen, imageUrls, initialSlideIndex, isVertical])

  const setSlideRef = useCallback((index: number, el: HTMLDivElement | null) => {
    slideRefs.current[index] = el
  }, [])

  useLayoutEffect(() => {
    if (!isOpen || isVertical) return
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
  }, [isOpen, imageUrls, isVertical])

  useLayoutEffect(() => {
    tlRef.current?.kill()
    tlRef.current = null
    if (!visible) return

    const el = rootRef.current
    if (!el) return

    gsap.killTweensOf(el)
    const reduced = motionReduced()

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
        tl.to(el, { autoAlpha: 1, duration: MOTION_REDUCED_S, ease: "none" })
      } else {
        tl.to(el, {
          autoAlpha: 1,
          scale: 1,
          duration: MOTION_SHEET_S,
          ease: EASE_STANDARD_OUT,
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
      tl.to(el, { autoAlpha: 0, duration: MOTION_REDUCED_S, ease: "none" })
    } else {
      tl.to(el, {
        autoAlpha: 0,
        scale: 0.98,
        duration: MOTION_SHEET_DISMISS_S,
        ease: EASE_STANDARD_IN,
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

  if (isVertical) {
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
          Scroll vertically to browse menu pages. Press Escape to close.
        </p>

        <div className="flex w-full shrink-0 flex-col gap-[15px] pt-[max(1.5rem,var(--safe-area-top))]">
          <div className="flex w-full items-center gap-4 px-6">
            <button
              type="button"
              className={VERTICAL_CLOSE_BTN}
              aria-label="Close menu"
              onClick={close}
            >
              <Cross size="md" aria-hidden />
            </button>
          </div>
          <div
            className="h-px w-full shrink-0 bg-[var(--color-border-separator)]"
            aria-hidden
          />
        </div>

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden px-3 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {imageUrls.map((src, i) => (
            <div
              key={`${src}-${i}`}
              ref={(el) => {
                setSlideRef(i, el)
              }}
              data-slide-index={i}
              className="relative w-full shrink-0 aspect-[553/737]"
            >
              <img
                src={src}
                alt={`${ariaLabel} page ${i + 1} of ${count}`}
                decoding="async"
                draggable={false}
                className="pointer-events-none absolute inset-0 size-full object-cover select-none"
              />
            </div>
          ))}
        </div>
      </div>,
      host,
    )
  }

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
