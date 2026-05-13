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

  return (
    <div
      ref={panelRef}
      role="alertdialog"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={hasDescription ? descriptionId : undefined}
      className={joinClassNames(
        "flex w-full max-w-full items-center gap-4 rounded-md bg-neutral-primary px-4 py-3",
        "bolt-font-body-s-regular text-primary-inverted",
        "min-w-60 shadow-[0_4px_16px_rgba(0,0,0,0.18)]",
      )}
    >
      <div className="flex w-full min-w-0 flex-row flex-wrap gap-3">
        <div className="min-w-0 flex-1">
          {title ?
            <div id={titleId} className="mb-1 font-semibold">
              {title}
            </div>
          : null}
          {hasDescription ?
            <div id={descriptionId}>{description}</div>
          : null}
        </div>
        {actionButtons ?
          <div className="ml-auto flex shrink-0 items-center">
            <div className="flex w-full justify-end gap-6">{actionButtons}</div>
          </div>
        : null}
      </div>

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
    </div>
  )
}
