import { GhostButton, IconButton } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface SnackbarToastProps {
  id: string | number
  content: SnackbarContent
}

function joinClassNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ")
}

/**
 * Toast body: matches Kalep Snackbar visuals; entry/exit motion is GSAP-driven
 * (Sonner list-item transitions are neutralized in CSS for this toaster).
 */
export function SnackbarToast({ id, content }: SnackbarToastProps) {
  const { title, description, actions, dismissible } = content
  const panelRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)
  const rootId = useId()
  const titleId = `${rootId}-title`
  const descriptionId = `${rootId}-description`

  const dismissWithAnimation = useCallback(() => {
    if (exitingRef.current) return
    exitingRef.current = true
    const el = panelRef.current
    if (!el || prefersReducedMotion()) {
      toast.dismiss(id)
      return
    }
    gsap.killTweensOf(el)
    gsap.to(el, {
      autoAlpha: 0,
      y: 10,
      scale: 0.98,
      duration: 0.32,
      ease: "power2.inOut",
      onComplete: () => {
        toast.dismiss(id)
      },
    })
  }, [id])

  useLayoutEffect(() => {
    const el = panelRef.current
    if (!el) return
    if (prefersReducedMotion()) {
      gsap.set(el, { autoAlpha: 1, y: 0, scale: 1 })
      return
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 14, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" },
      )
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const raw = content.timeout
    if (
      raw == null ||
      raw === Number.POSITIVE_INFINITY ||
      !Number.isFinite(raw) ||
      raw <= 0
    ) {
      return
    }
    const tid = window.setTimeout(() => dismissWithAnimation(), raw)
    return () => window.clearTimeout(tid)
  }, [content.timeout, dismissWithAnimation])

  const actionButtons = actions?.length
    ? actions.map((action) => (
        <GhostButton
          key={action.label}
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

  const hasCloseButton = actionButtons ? false : (dismissible ?? true)

  const hasDescription = description.trim().length > 0
  const stackedLayout = Boolean(actionButtons)

  const textBlock = (
    <div
      className={
        stackedLayout ? "flex min-w-0 flex-1 flex-col gap-2" : "min-w-0 flex-1"
      }
    >
      {title ?
        <div
          id={titleId}
          className={
            stackedLayout ?
              "bolt-font-body-m-accent font-semibold"
            : "mb-1 font-semibold"
          }
        >
          {title}
        </div>
      : null}
      {hasDescription ?
        <div id={descriptionId}>{description}</div>
      : null}
    </div>
  )

  return (
    <div
      ref={panelRef}
      role="alertdialog"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={joinClassNames(
        "relative w-full max-w-full rounded-lg bg-neutral-primary px-4 py-3",
        "bolt-font-body-s-regular text-primary-inverted",
        "min-w-60 shadow-[0_1px_3px_rgba(47,49,61,0.04),0_4px_8px_rgba(47,49,61,0.08),0_8px_16px_rgba(47,49,61,0.08)]",
        stackedLayout ? "flex flex-col gap-2" : "flex items-center gap-4",
      )}
    >
      {stackedLayout ?
        <>
          {textBlock}
          {actionButtons ?
            <div className="flex w-full shrink-0 items-center justify-end gap-7">
              {actionButtons}
            </div>
          : null}
        </>
      : <>
          {textBlock}
          {hasCloseButton ?
            <IconButton
              data-testid="snackbar-close-button"
              overrideClassName="text-primary-inverted h-6 w-6 shrink-0"
              size="sm"
              aria-label="Close"
              onClick={dismissWithAnimation}
              icon={<Cross size="sm" />}
            />
          : null}
        </>
      }
    </div>
  )
}
