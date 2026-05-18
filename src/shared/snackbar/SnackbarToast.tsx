import { GhostButton, IconButton } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import { useCallback, useEffect, useId, useLayoutEffect, useRef } from "react"
import { toast } from "sonner"
import { resolveSnackbarDismiss } from "@/shared/snackbar/resolveSnackbarDismiss"
import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

export interface SnackbarToastProps {
  id: string | number
  content: SnackbarContent
}

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
 * Toast body: matches Kalep Snackbar visuals; entry/exit motion is GSAP-driven
 * (Sonner list-item transitions are neutralized in CSS for this toaster).
 */
export function SnackbarToast({ id, content }: SnackbarToastProps) {
  const { title, description, actions } = content
  const { showCloseButton, timeoutMs } = resolveSnackbarDismiss(content)
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
    const tid = window.setTimeout(() => dismissWithAnimation(), timeoutMs)
    return () => window.clearTimeout(tid)
  }, [dismissWithAnimation, timeoutMs])

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

  const hasDescription = description.trim().length > 0
  const stackedLayout = Boolean(actionButtons)

  return (
    <div
      ref={panelRef}
      role="status"
      aria-live="polite"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={joinClassNames(
        "relative w-full max-w-full rounded-lg bg-neutral-primary px-4 py-3",
        "bolt-font-body-s-regular text-primary-inverted",
        "min-w-0 w-full shadow-[0_1px_1.5px_rgba(47,49,61,0.04),0_4px_4px_rgba(47,49,61,0.08),0_8px_8px_rgba(47,49,61,0.08)]",
        stackedLayout ? "flex flex-col gap-2" : "flex items-center gap-4",
      )}
    >
      {stackedLayout ?
        <>
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {title ?
                <div
                  id={titleId}
                  className="bolt-font-body-m-accent font-semibold"
                >
                  {title}
                </div>
              : null}
              {hasDescription ?
                <div id={descriptionId}>{description}</div>
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
                className="bolt-font-body-m-accent mb-1 font-semibold"
              >
                {title}
              </div>
            : null}
            {hasDescription ?
              <div id={descriptionId}>{description}</div>
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
