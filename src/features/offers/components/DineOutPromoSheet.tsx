import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import MobilePayment from "@bolteu/kalep-react-icons/dist/MobilePayment"
import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import Walk from "@bolteu/kalep-react-icons/dist/Walk"
import gsap from "gsap"
import { CustomEase } from "gsap/CustomEase"
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from "react"
import { createPortal } from "react-dom"
import { useDeviceShell } from "@/shared/context/useDeviceShell"
import {
  DINEOUT_PROMO_CTA_LABEL,
  DINEOUT_PROMO_INTRO,
  DINEOUT_PROMO_STEPS,
  DINEOUT_PROMO_TITLE,
} from "@/features/offers/constants/dineOutPromoContent"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"
import {
  SHEET_CLOSE_ICON_OVER_MEDIA_CLASS,
  SHEET_CLOSE_OVER_MEDIA_CLASS,
} from "@/shared/utils/sheetCloseButtonClass"
import {
  VAUL_SHEET_FOOTER_CLASS,
  VAUL_SHEET_SCROLL_BODY_CLASS,
} from "@/shared/utils/vaulAppSheetShell"
gsap.registerPlugin(CustomEase)

const EASE_IN = CustomEase.create("dineOutPromoIn", "M0,0,C0.32,0.72,0,1,1,1")
const EASE_OUT = CustomEase.create("dineOutPromoOut", "M0,0,C0.4,0,1,1,1,1")

const SCRIM_MAX = 0.28
const DISMISS_DRAG_PX = 80
const DISMISS_VELOCITY = 500

const STEP_ICONS: ReactElement[] = [
  <PercentFlower key="pct" size="lg" className="shrink-0 text-action-primary" aria-hidden />,
  <Walk key="walk" size="lg" className="shrink-0 text-action-primary" aria-hidden />,
  <Food key="food" size="lg" className="shrink-0 text-action-primary" aria-hidden />,
  <Receipt key="receipt" size="lg" className="shrink-0 text-action-primary" aria-hidden />,
  <MobilePayment key="pay" size="lg" className="shrink-0 text-action-primary" aria-hidden />,
]

export interface DineOutPromoSheetProps {
  isVisible: boolean
  onDismiss: () => void
  heroImage: string
}

function sheetHeightPx(el: HTMLElement | null): number {
  if (!el) return Math.round(window.innerHeight * 0.5)
  return el.offsetHeight || Math.round(window.innerHeight * 0.5)
}

/**
 * Bottom promo sheet (Figma `16084:48918`): scrim, hero cover, feature list,
 * sticky CTA, GSAP motion, swipe-down on hero, scrim tap / Escape / CTA / close.
 */
export function DineOutPromoSheet({
  isVisible,
  onDismiss,
  heroImage,
}: DineOutPromoSheetProps) {
  const { portalRoot } = useDeviceShell()
  const host =
    portalRoot ?? (typeof document === "undefined" ? null : document.body)
  const titleId = useId()
  const introId = useId()

  const [mounted, setMounted] = useState(false)
  const [heroFailed, setHeroFailed] = useState(false)
  const scrimRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)
  const enterDoneRef = useRef(false)
  const historyEntryRef = useRef<string | null>(null)

  const dragRef = useRef<{
    active: boolean
    startY: number
    pointerId: number
    moves: { t: number; y: number }[]
  }>({ active: false, startY: 0, pointerId: -1, moves: [] })

  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  useLayoutEffect(() => {
    if (!isVisible) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount before exit tween; reset hero error on open
    setMounted(true)
    setHeroFailed(false)
  }, [isVisible])

  const visible = isVisible || mounted

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismissRef.current()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [visible])

  useEffect(() => {
    if (!isVisible) return
    const historyEntry = `dineout-promo-${Date.now()}-${Math.random().toString(36).slice(2)}`
    historyEntryRef.current = historyEntry
    window.history.pushState({ __dineOutPromo: historyEntry }, "")
    const onPop = () => {
      if (historyEntryRef.current === historyEntry) {
        historyEntryRef.current = null
      }
      onDismissRef.current()
    }
    window.addEventListener("popstate", onPop)
    return () => {
      window.removeEventListener("popstate", onPop)
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible) return
    const historyEntry = historyEntryRef.current
    if (!historyEntry) return
    historyEntryRef.current = null
    if (
      (window.history.state as { __dineOutPromo?: string } | null)
        ?.__dineOutPromo === historyEntry
    ) {
      window.history.back()
    }
  }, [isVisible])

  useLayoutEffect(() => {
    tlRef.current?.kill()
    tlRef.current = null
    if (!visible) return

    const scrim = scrimRef.current
    const sheet = sheetRef.current
    if (!scrim || !sheet) return

    gsap.killTweensOf([scrim, sheet])

    const reduced = prefersReducedMotion()
    enterDoneRef.current = false

    if (isVisible) {
      const h = sheetHeightPx(sheet)
      gsap.set(scrim, { autoAlpha: 0, opacity: 0 })
      if (reduced) {
        gsap.set(sheet, { y: 0, autoAlpha: 0 })
      } else {
        gsap.set(sheet, { y: h })
      }

      const tl = gsap.timeline({
        onComplete: () => {
          enterDoneRef.current = true
        },
      })
      tlRef.current = tl
      if (reduced) {
        tl.to(scrim, { autoAlpha: 1, opacity: SCRIM_MAX, duration: 0.12 }).to(
          sheet,
          { autoAlpha: 1, duration: 0.12 },
          0,
        )
      } else {
        tl.to(
          scrim,
          { autoAlpha: 1, opacity: SCRIM_MAX, duration: 0.28, ease: "power1.out" },
          0,
        ).to(sheet, { y: 0, duration: 0.32, ease: EASE_IN }, 0)
      }
      return () => {
        tl.kill()
      }
    }

    enterDoneRef.current = false
    const h = sheetHeightPx(sheet)
    const tl = gsap.timeline({
      onComplete: () => setMounted(false),
    })
    tlRef.current = tl
    if (reduced) {
      tl.to([sheet, scrim], { autoAlpha: 0, duration: 0.12 })
    } else {
      tl.to(sheet, { y: h, duration: 0.24, ease: EASE_OUT }, 0).to(
        scrim,
        { autoAlpha: 0, opacity: 0, duration: 0.24, ease: EASE_OUT },
        0,
      )
    }
    return () => {
      tl.kill()
    }
  }, [visible, isVisible])

  const setScrimForDrag = useCallback((dragY: number) => {
    const scrim = scrimRef.current
    const sheet = sheetRef.current
    if (!scrim || !sheet) return
    const h = sheetHeightPx(sheet)
    const o = SCRIM_MAX * Math.max(0, 1 - dragY / h)
    gsap.set(scrim, { opacity: o, autoAlpha: 1 })
  }, [])

  const resetAfterDrag = useCallback(() => {
    const scrim = scrimRef.current
    const sheet = sheetRef.current
    if (!scrim || !sheet) return
    gsap.killTweensOf([sheet, scrim])
    gsap.set(sheet, { y: 0 })
    gsap.set(scrim, { opacity: SCRIM_MAX, autoAlpha: 1 })
  }, [])

  const heroPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!enterDoneRef.current) return
    if (e.pointerType === "mouse" && e.button !== 0) return
    tlRef.current?.kill()
    gsap.killTweensOf([sheetRef.current, scrimRef.current])
    const d = dragRef.current
    d.active = true
    d.startY = e.clientY
    d.pointerId = e.pointerId
    d.moves = [{ t: performance.now(), y: e.clientY }]
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const heroPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d.active || e.pointerId !== d.pointerId) return
    const dy = e.clientY - d.startY
    if (dy < 0) return
    const now = performance.now()
    d.moves.push({ t: now, y: e.clientY })
    if (d.moves.length > 8) d.moves.shift()
    const sheet = sheetRef.current
    if (sheet) gsap.set(sheet, { y: dy })
    setScrimForDrag(dy)
  }

  const heroPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current
    if (!d.active || e.pointerId !== d.pointerId) return
    d.active = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    const dy = e.clientY - d.startY
    const m = d.moves
    let v = 0
    if (m.length >= 2) {
      const a = m[m.length - 1]
      const b = m[0]
      const dt = (a.t - b.t) / 1000
      if (dt > 0) v = (a.y - b.y) / dt
    }
    const sheet = sheetRef.current
    const scrim = scrimRef.current

    if (dy > DISMISS_DRAG_PX || v > DISMISS_VELOCITY) {
      resetAfterDrag()
      onDismissRef.current()
      return
    }
    if (dy > 0 && sheet && scrim) {
      gsap.to(sheet, {
        y: 0,
        duration: 0.32,
        ease: EASE_IN,
        overwrite: true,
        onUpdate: () => {
          const cur = (gsap.getProperty(sheet, "y") as number) || 0
          const h = sheetHeightPx(sheet)
          const o = SCRIM_MAX * Math.max(0, 1 - cur / h)
          gsap.set(scrim, { opacity: o, autoAlpha: 1 })
        },
        onComplete: () => {
          gsap.set(sheet, { y: 0 })
          gsap.set(scrim, { opacity: SCRIM_MAX, autoAlpha: 1 })
        },
      })
    } else {
      resetAfterDrag()
    }
  }

  const scrimPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onDismiss()
  }

  if ((!isVisible && !mounted) || !host) return null

  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[125]"
      style={{ minHeight: "var(--app-h)" }}
    >
      <div
        ref={scrimRef}
        className="absolute inset-0 z-0 bg-[rgba(0,0,0,0.28)]"
        onPointerDown={scrimPointerDown}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 top-[var(--modal-top-gap)] z-[1] flex justify-center">
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={introId}
          className="pointer-events-auto relative flex max-h-[min(97dvh,var(--app-h,100dvh))] min-h-0 w-full max-w-[var(--shell-width)] flex-col overflow-hidden rounded-t-[var(--sheet-radius)] bg-layer-floor-1 shadow-[var(--elevation-2)]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Close"
            className={SHEET_CLOSE_OVER_MEDIA_CLASS}
            onClick={() => onDismiss()}
          >
            <Cross
              size="xs"
              className={SHEET_CLOSE_ICON_OVER_MEDIA_CLASS}
              aria-hidden
            />
          </button>

          <div className={`${VAUL_SHEET_SCROLL_BODY_CLASS} min-h-0 flex-1`}>
            <div
              className="relative w-full touch-none"
              style={{ aspectRatio: "375 / 250" }}
              onPointerDown={heroPointerDown}
              onPointerMove={heroPointerMove}
              onPointerUp={heroPointerUp}
              onPointerCancel={heroPointerUp}
            >
              {!heroFailed ? (
                <img
                  key={heroImage}
                  src={heroImage}
                  alt=""
                  className="block size-full object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setHeroFailed(true)}
                />
              ) : (
                <div className="aspect-[375/250] w-full bg-special-brand-alt" aria-hidden />
              )}
            </div>

            <div className="flex flex-col gap-2 p-6">
              <div id={titleId}>
                <Typography as="h2" variant="heading-m-accent" color="primary">
                  {DINEOUT_PROMO_TITLE}
                </Typography>
              </div>
              <div id={introId}>
                <Typography as="p" variant="body-m-regular" color="secondary">
                  {DINEOUT_PROMO_INTRO}
                </Typography>
              </div>
              <ul className="m-0 flex list-none flex-col p-0" aria-label="How it works">
                {DINEOUT_PROMO_STEPS.map((step, index) => (
                  <li key={step.id} className="py-[10px]">
                    <div className="flex gap-3">
                      <span className="shrink-0">{STEP_ICONS[index]}</span>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Typography
                          as="span"
                          variant="body-m-accent"
                          color="primary"
                        >
                          {step.title}
                        </Typography>
                        <Typography
                          as="span"
                          variant="body-s-regular"
                          color="secondary"
                        >
                          {step.subtitle}
                        </Typography>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={VAUL_SHEET_FOOTER_CLASS}>
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onDismiss()}
            >
              {DINEOUT_PROMO_CTA_LABEL}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    host,
  )
}
