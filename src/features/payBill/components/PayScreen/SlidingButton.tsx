import { Typography } from "@bolteu/kalep-react"
import ArrowRight from "@bolteu/kalep-react-icons/dist/ArrowRight"
import Check from "@bolteu/kalep-react-icons/dist/Check"
import gsap from "gsap"
import { useCallback, useLayoutEffect, useRef } from "react"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface SlidingButtonProps {
  label: string
  sublabel?: string
  onComplete: () => void
  isLoading?: boolean
  disabled?: boolean
}

/** Slider handle — matches comfortable touch target inside 56px track. */
const THUMB_PX = 48
/** Space between handle edge and label block (Figma / swipe-button style). */
const LABEL_GAP_PX = 8
/** Release at or past this fraction of travel counts as confirm. */
const COMPLETE_RATIO = 0.85

const labelInsetStart = THUMB_PX + LABEL_GAP_PX

/**
 * Slide-to-confirm: full-width Kalep-styled track, thumb translateX only (no double offset),
 * label fades and arrow → check; elastic snap if released early (same interaction model as
 * [swipe-button](https://swipe-button.vercel.app/) — pointer + measured rail width).
 */
export function SlidingButton({
  label,
  sublabel,
  onComplete,
  isLoading,
  disabled,
}: SlidingButtonProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)
  const checkRef = useRef<HTMLSpanElement>(null)

  const drag = useRef({
    active: false,
    startClientX: 0,
    startX: 0,
    completed: false,
    vibrated: false,
    pointerId: null as number | null,
  })

  const disabledRef = useRef(disabled)
  const isLoadingRef = useRef(isLoading)
  const onCompleteRef = useRef(onComplete)

  const moveRef = useRef<(e: PointerEvent) => void>(() => {})
  const upRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    disabledRef.current = disabled
    isLoadingRef.current = isLoading
    onCompleteRef.current = onComplete
  }, [disabled, isLoading, onComplete])

  const maxTravel = useCallback(() => {
    const rail = railRef.current
    if (!rail) return 0
    const w = Math.floor(rail.getBoundingClientRect().width)
    return Math.max(0, w - THUMB_PX)
  }, [])

  const setLabelFade = useCallback((progress: number) => {
    const el = labelsRef.current
    if (!el) return
    const o = Math.max(0, 1 - progress * 1.2)
    el.style.opacity = String(o)
  }, [])

  const setIconCrossfade = useCallback((progress: number) => {
    const a = arrowRef.current
    const c = checkRef.current
    if (!a || !c) return
    const t = Math.min(1, Math.max(0, progress / 0.55))
    a.style.opacity = String(1 - t)
    c.style.opacity = String(t)
  }, [])

  const snapThumbToLoadingCenter = useCallback(() => {
    const rail = railRef.current
    const thumb = thumbRef.current
    if (!rail || !thumb) return
    const max = Math.max(0, Math.floor(rail.getBoundingClientRect().width) - THUMB_PX)
    const centerX = max > 0 ? Math.round(max / 2) : 0
    gsap.killTweensOf(thumb)
    gsap.set(thumb, { x: centerX })
    setLabelFade(1)
    setIconCrossfade(1)
  }, [setIconCrossfade, setLabelFade])

  useLayoutEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const onResize = () => {
      const thumb = thumbRef.current
      if (!thumb) return
      const max = Math.max(0, Math.floor(rail.getBoundingClientRect().width) - THUMB_PX)
      const x = (gsap.getProperty(thumb, "x") as number) || 0
      if (x > max) gsap.set(thumb, { x: max })
      if (isLoadingRef.current) snapThumbToLoadingCenter()
    }

    const ro = new ResizeObserver(onResize)
    ro.observe(rail)
    onResize()
    return () => ro.disconnect()
  }, [snapThumbToLoadingCenter])

  const snapHome = useCallback(() => {
    const thumb = thumbRef.current
    if (!thumb) return
    gsap.killTweensOf(thumb)
    setLabelFade(0)
    setIconCrossfade(0)
    if (prefersReducedMotion()) {
      gsap.set(thumb, { x: 0 })
      return
    }
    gsap.to(thumb, {
      x: 0,
      duration: 0.4,
      ease: "elastic.out(1, 0.35)",
    })
  }, [setIconCrossfade, setLabelFade])

  const finishDrag = useCallback(() => {
    const thumb = thumbRef.current
    const d = drag.current
    if (!d.active) return
    d.active = false
    window.removeEventListener("pointermove", moveRef.current)
    window.removeEventListener("pointerup", upRef.current)
    window.removeEventListener("pointercancel", upRef.current)
    if (thumb && d.pointerId != null) {
      try {
        thumb.releasePointerCapture(d.pointerId)
      } catch {
        /* not capturing */
      }
    }
    d.pointerId = null
    if (!thumb || disabledRef.current || isLoadingRef.current || d.completed) return
    const max = maxTravel()
    const x = (gsap.getProperty(thumb, "x") as number) || 0
    const progress = max > 0 ? x / max : 0
    if (progress >= COMPLETE_RATIO) {
      d.completed = true
      const runComplete = () => {
        onCompleteRef.current()
      }
      if (prefersReducedMotion()) {
        gsap.set(thumb, { x: max })
        setLabelFade(1)
        setIconCrossfade(1)
        runComplete()
        return
      }
      gsap.killTweensOf(thumb)
      gsap.to(thumb, {
        x: max,
        duration: 0.22,
        ease: "power2.out",
        onComplete: runComplete,
      })
      setLabelFade(1)
      setIconCrossfade(1)
      return
    }
    d.vibrated = false
    snapHome()
  }, [maxTravel, setIconCrossfade, setLabelFade, snapHome])

  const handleMove = useCallback(
    (e: PointerEvent) => {
      const thumb = thumbRef.current
      if (!thumb || disabledRef.current || isLoadingRef.current) return
      const max = maxTravel()
      const d = drag.current
      const dx = e.clientX - d.startClientX
      let x = d.startX + dx
      if (x < 0) x = 0
      if (x > max) x = max
      gsap.set(thumb, { x })
      const progress = max > 0 ? x / max : 0
      setLabelFade(progress)
      setIconCrossfade(progress)
      if (progress >= COMPLETE_RATIO && !d.vibrated) {
        d.vibrated = true
        try {
          navigator.vibrate?.(10)
        } catch {
          /* ignore */
        }
      }
    },
    [maxTravel, setIconCrossfade, setLabelFade],
  )

  const handleUp = useCallback(() => {
    finishDrag()
  }, [finishDrag])

  useLayoutEffect(() => {
    moveRef.current = handleMove
    upRef.current = handleUp
  }, [handleMove, handleUp])

  useLayoutEffect(() => {
    if (!isLoading) {
      drag.current.completed = false
    }
    const thumb = thumbRef.current
    if (!thumb) return
    if (!isLoading) {
      gsap.set(thumb, { x: 0 })
      setLabelFade(0)
      setIconCrossfade(0)
    }
  }, [isLoading, setIconCrossfade, setLabelFade])

  useLayoutEffect(() => {
    if (!isLoading) return
    snapThumbToLoadingCenter()
  }, [isLoading, snapThumbToLoadingCenter])

  const onThumbDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || isLoading) return
      e.preventDefault()
      const thumb = thumbRef.current
      if (!thumb) return
      const d = drag.current
      d.active = true
      d.startClientX = e.clientX
      d.startX = (gsap.getProperty(thumb, "x") as number) || 0
      d.vibrated = false
      d.pointerId = e.pointerId
      thumb.setPointerCapture(e.pointerId)
      window.addEventListener("pointermove", moveRef.current)
      window.addEventListener("pointerup", upRef.current)
      window.addEventListener("pointercancel", upRef.current)
    },
    [disabled, isLoading],
  )

  const onThumbKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || isLoading) return
      const thumb = thumbRef.current
      if (!thumb || drag.current.completed) return
      const max = maxTravel()
      if (max <= 0) return

      let x = (gsap.getProperty(thumb, "x") as number) || 0
      const step = Math.max(8, Math.round(max * 0.08))

      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault()
        x = Math.min(max, x + step)
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault()
        x = Math.max(0, x - step)
      } else if (e.key === "End") {
        e.preventDefault()
        x = max
      } else if (e.key === "Home") {
        e.preventDefault()
        x = 0
      } else {
        return
      }

      gsap.killTweensOf(thumb)
      gsap.set(thumb, { x })
      const progress = x / max
      setLabelFade(progress)
      setIconCrossfade(progress)

      if (progress >= COMPLETE_RATIO) {
        drag.current.completed = true
        const runComplete = () => {
          onCompleteRef.current()
        }
        if (prefersReducedMotion()) {
          gsap.set(thumb, { x: max })
          setLabelFade(1)
          setIconCrossfade(1)
          runComplete()
          return
        }
        gsap.to(thumb, {
          x: max,
          duration: 0.22,
          ease: "power2.out",
          onComplete: runComplete,
        })
        setLabelFade(1)
        setIconCrossfade(1)
      }
    },
    [disabled, isLoading, maxTravel, setIconCrossfade, setLabelFade],
  )

  const trackMuted =
    disabled || isLoading ?
      "bg-action-primary/25"
    : "bg-action-primary"

  return (
    <div
      role="group"
      aria-label={`${label}. ${sublabel ?? "Slide to confirm"}`}
      className={[
        "relative flex h-14 w-full shrink-0 touch-none items-stretch overflow-hidden rounded-full py-1 pl-1 pr-2 shadow-[var(--elevation-2)] select-none transition-[filter] duration-150",
        trackMuted,
        disabled ? "opacity-70" : "hover:brightness-[1.02] active:brightness-[0.98]",
      ].join(" ")}
    >
      <div ref={railRef} className="relative h-full min-w-0 flex-1">
        <div
          ref={labelsRef}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pr-3 text-center transition-none"
          style={{
            opacity: disabled ? 0.55 : 1,
            paddingLeft: labelInsetStart,
          }}
        >
          <Typography
            variant="body-l-accent"
            color="primary-inverted"
            as="span"
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
            }}
          >
            {label}
          </Typography>
          {sublabel ?
            <span className="opacity-80">
              <Typography variant="body-xs-regular" color="primary-inverted" as="span">
                {sublabel}
              </Typography>
            </span>
          : null}
        </div>
        <div
          ref={thumbRef}
          role="slider"
          tabIndex={disabled || isLoading ? -1 : 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Slide to confirm"
          aria-disabled={disabled || isLoading}
          className="absolute left-0 top-1/2 z-[1] flex -translate-y-1/2 cursor-grab items-center justify-center rounded-full bg-static-key-light shadow-[var(--elevation-2)] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-static-key-light focus-visible:ring-offset-2 focus-visible:ring-offset-action-primary enabled:hover:brightness-[1.03] enabled:active:brightness-[0.97]"
          style={{ width: THUMB_PX, height: THUMB_PX }}
          onPointerDown={onThumbDown}
          onKeyDown={onThumbKeyDown}
        >
          {isLoading ?
            <Check size="md" className="text-action-primary" aria-hidden />
          : (
            <span className="relative flex size-6 items-center justify-center" aria-hidden>
              <span
                ref={arrowRef}
                className="absolute inset-0 flex items-center justify-center opacity-100"
              >
                <ArrowRight size="md" className="text-action-primary" />
              </span>
              <span
                ref={checkRef}
                className="absolute inset-0 flex items-center justify-center opacity-0"
              >
                <Check size="md" className="text-action-primary" />
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
