import { GhostButton, IconButton } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import { resolveSnackbarDismiss } from "@/shared/snackbar/resolveSnackbarDismiss"
import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"
import {
  EASE_EMPHASIZED_ENTER,
  EASE_EMPHASIZED_EXIT,
  MOTION_SNACKBAR_ENTER_S,
  MOTION_SNACKBAR_EXIT_S,
} from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"

/** Slide distance — toast rises from below / settles downward on dismiss. */
const SNACKBAR_ENTER_Y_PX = 20
const SNACKBAR_EXIT_Y_PX = 12

export interface SnackbarToastProps {
  id: string | number
  content: SnackbarContent
}

const SWIPE_DISMISS_DELTA_PX = 48

function joinClassNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}

function CloseControl({ onDismiss }: { onDismiss: () => void }) {
  return (
    <IconButton
      data-testid="snackbar-close-button"
      overrideClassName="text-primary-inverted h-6 w-6 shrink-0"
      size="sm"
      aria-label="Close"
      onClick={onDismiss}
      icon={<Cross size="sm" />}
    />
  )
}

/**
 * Toast body: Kalep Snackbar visuals; GSAP enter/exit follows iOS HIG motion
 * (emphasized decelerating present, faster accelerating dismiss; Sonner host
 * transitions are neutralized in CSS).
 */
const TITLE_COMPACT_LINE = {
  lineHeight: "var(--body-m-compact-line-height, 20px)",
} as const

export function SnackbarToast({ id, content }: SnackbarToastProps) {
  const { title, description, actions, descriptionColor } = content
  const { showCloseButton, swipeToDismiss, timeoutMs } =
    resolveSnackbarDismiss(content)
  const panelRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)
  const enteredRef = useRef(false)
  const swipeStartYRef = useRef<number | null>(null)
  const rootId = useId()
  const titleId = `${rootId}-title`
  const descriptionId = `${rootId}-description`

  const dismissWithAnimation = useCallback(() => {
    if (exitingRef.current) return
    exitingRef.current = true
    const el = panelRef.current
    if (!el || motionReduced()) {
      toast.dismiss(id)
      return
    }
    gsap.killTweensOf(el)
    gsap.to(el, {
      autoAlpha: 0,
      y: SNACKBAR_EXIT_Y_PX,
      duration: MOTION_SNACKBAR_EXIT_S,
      ease: EASE_EMPHASIZED_EXIT,
      overwrite: true,
      onComplete: () => {
        toast.dismiss(id)
      },
    })
  }, [id])

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (motionReduced()) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      enteredRef.current = true
      return
    }
    if (enteredRef.current) {
      gsap.set(el, { autoAlpha: 1, y: 0 })
      return
    }
    enteredRef.current = true
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: SNACKBAR_ENTER_Y_PX },
        {
          autoAlpha: 1,
          y: 0,
          duration: MOTION_SNACKBAR_ENTER_S,
          ease: EASE_EMPHASIZED_ENTER,
          overwrite: true,
        },
      )
    }, el)
    // Do not `revert()` — Sonner may re-run this effect while the toast id is stable,
    // and revert would flash the panel back to hidden mid-animation.
    return () => {
      ctx.kill()
      gsap.set(el, { autoAlpha: 1, y: 0 })
    }
    // One-shot entry per toast mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- panel ref only
  }, [])

  useEffect(() => {
    const tid = window.setTimeout(() => dismissWithAnimation(), timeoutMs)
    return () => window.clearTimeout(tid)
  }, [dismissWithAnimation, timeoutMs])

  useEffect(() => {
    if (!swipeToDismiss) return
    const el = panelRef.current
    if (!el) return

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      swipeStartYRef.current = e.clientY
    }

    const onPointerUp = (e: PointerEvent) => {
      const startY = swipeStartYRef.current
      swipeStartYRef.current = null
      if (startY == null) return
      if (e.clientY - startY >= SWIPE_DISMISS_DELTA_PX) {
        dismissWithAnimation()
      }
    }

    const onPointerCancel = () => {
      swipeStartYRef.current = null
    }

    el.addEventListener("pointerdown", onPointerDown)
    el.addEventListener("pointerup", onPointerUp)
    el.addEventListener("pointercancel", onPointerCancel)
    return () => {
      el.removeEventListener("pointerdown", onPointerDown)
      el.removeEventListener("pointerup", onPointerUp)
      el.removeEventListener("pointercancel", onPointerCancel)
    }
  }, [dismissWithAnimation, swipeToDismiss])

  const actionButtons = actions?.length
    ? actions.map((action, index) => (
        <GhostButton
          key={`${action.label}-${index}`}
          overrideClassName="flex-shrink-0 font-semibold text-action-primary-inverted"
          onClick={() => {
            action.onClick()
            dismissWithAnimation()
          }}
        >
          {action.label}
        </GhostButton>
      ))
    : null

  const hasDescription = description.trim().length > 0
  const stackedLayout = Boolean(actionButtons)
  const descriptionClassName = joinClassNames(
    descriptionColor === "secondary-inverted" ?
      "text-secondary-inverted"
    : undefined,
  )

  return (
    <div
      ref={panelRef}
      role="status"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={joinClassNames(
        "relative min-h-[48px] w-full max-w-full rounded-[12px] bg-neutral-primary px-4 py-3",
        "bolt-font-body-s-regular text-primary-inverted",
        "min-w-0 shadow-[0_1px_1.5px_rgba(47,49,61,0.04),0_4px_4px_rgba(47,49,61,0.08),0_8px_8px_rgba(47,49,61,0.08)]",
        stackedLayout ? "flex flex-col gap-2" : "flex items-center gap-4",
        swipeToDismiss ? "touch-pan-y" : undefined,
      )}
    >
      {stackedLayout ?
        <>
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {title ?
                <div
                  id={titleId}
                  className="py-0.5 bolt-font-body-m-accent font-semibold"
                  style={TITLE_COMPACT_LINE}
                >
                  {title}
                </div>
              : null}
              {hasDescription ?
                <div
                  id={descriptionId}
                  className={joinClassNames("py-0.5", descriptionClassName)}
                >
                  {description}
                </div>
              : null}
            </div>
            {showCloseButton ?
              <CloseControl onDismiss={dismissWithAnimation} />
            : null}
          </div>
          {actionButtons ?
            <div className="flex w-full shrink-0 items-center justify-end gap-7">
              {actionButtons}
            </div>
          : null}
        </>
      : <>
          <div className="min-w-0 flex-1">
            {title ?
              <div
                id={titleId}
                className="py-0.5 bolt-font-body-m-accent font-semibold"
                style={TITLE_COMPACT_LINE}
              >
                {title}
              </div>
            : null}
            {hasDescription ?
              <div
                id={descriptionId}
                className={joinClassNames("py-0.5", descriptionClassName)}
              >
                {description}
              </div>
            : null}
          </div>
          {showCloseButton ?
            <CloseControl onDismiss={dismissWithAnimation} />
          : null}
        </>
      }
    </div>
  )
}
