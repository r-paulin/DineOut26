import { Button, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CLAIM_OFFER_CLAIMED_CHECKMARK_SRC } from "@/features/offers/constants/claimFlowHero"
import {
  CLAIM_OFFER_SUCCESS_CTA,
  CLAIM_OFFER_SUCCESS_TITLE,
} from "@/features/offers/constants/claimOfferSuccessCopy"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { formatClaimOfferSuccessArrivalSubtitle } from "@/features/offers/utils/formatClaimedArrivalDate"
import { Z_CLAIM_SUCCESS } from "@/features/restaurant/constants/screenLayers"
import { useModalOverlayLock } from "@/shared/hooks/useModalOverlayLock"
import {
  EASE_EMPHASIZED_EXIT,
  EASE_STANDARD_OUT,
  MOTION_REDUCED_S,
  MOTION_SHEET_DISMISS_S,
  MOTION_SHEET_S,
  motionReduced,
} from "@/shared/motion"

const TITLE_STYLE = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
  color: "var(--color-static-content-key-light)",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const SUBTITLE_STYLE = {
  color: "var(--color-static-content-secondary-light, rgba(244, 254, 249, 0.69))",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

/** Soft spring overshoot — same family as PaySuccess / Map FAB (iOS-like). */
const EASE_SPRING_ENTER = "back.out(1.25)" as const

const CHECKMARK_ENTER_S = 0.55

export interface ClaimOfferSuccessSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  claim: ClaimedOffer
  onDone: () => void
  /** Fires once after the screen finishes animating closed. */
  onExitComplete?: () => void
  container?: HTMLElement | null
}

/**
 * Fullscreen post-claim success (Figma `17421:31561`).
 * Opaque brand fill from the first frame (never see-through). Copy/close/CTA
 * fade in softly; checkmark springs in after that fade. The whole screen fades
 * on dismiss. Got it → claimed offer; X → restaurant (parent wires).
 */
export function ClaimOfferSuccessSheet({
  isOpen,
  onOpenChange,
  claim,
  onDone,
  onExitComplete,
  container,
}: ClaimOfferSuccessSheetProps) {
  const titleId = useId()
  const subtitleId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const checkmarkRef = useRef<HTMLImageElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const onExitCompleteRef = useRef(onExitComplete)
  const [mounted, setMounted] = useState(isOpen)
  const [controlsReady, setControlsReady] = useState(false)
  const arrivalSubtitle = formatClaimOfferSuccessArrivalSubtitle(claim)

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useModalOverlayLock({
    active: isOpen && mounted,
    containerRef: rootRef,
    onEscape: handleClose,
    autoFocus: controlsReady,
  })

  useEffect(() => {
    onExitCompleteRef.current = onExitComplete
  }, [onExitComplete])

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useLayoutEffect(() => {
    if (!mounted) return

    const root = rootRef.current
    const close = closeRef.current
    const checkmark = checkmarkRef.current
    const copy = copyRef.current
    const cta = ctaRef.current
    if (!root || !close || !checkmark || !copy || !cta) return

    const reduced = motionReduced()
    const enterS = reduced ? MOTION_REDUCED_S : MOTION_SHEET_S
    const exitS = reduced ? MOTION_REDUCED_S : MOTION_SHEET_DISMISS_S
    const content = [close, checkmark, copy, cta]

    gsap.killTweensOf([root, ...content])

    if (!isOpen) {
      gsap.to(root, {
        autoAlpha: 0,
        duration: exitS,
        ease: EASE_EMPHASIZED_EXIT,
        overwrite: true,
        onComplete: () => {
          setMounted(false)
          onExitCompleteRef.current?.()
        },
      })
      return () => {
        gsap.killTweensOf(root)
      }
    }

    if (reduced) {
      gsap.set(root, { autoAlpha: 1 })
      gsap.set([close, copy, cta], { opacity: 1, visibility: "visible" })
      gsap.set(checkmark, {
        opacity: 1,
        visibility: "visible",
        scale: 1,
        clearProps: "transform",
      })
      setControlsReady(true)
      return
    }

    gsap.set(root, { autoAlpha: 1, visibility: "visible" })
    gsap.set([close, copy, cta], { opacity: 0, visibility: "visible" })
    gsap.set(checkmark, {
      opacity: 0,
      visibility: "visible",
      scale: 0.72,
      transformOrigin: "50% 50%",
    })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(checkmark, { clearProps: "transform" })
      },
    })
    tl.to([close, copy, cta], {
      opacity: 1,
      duration: enterS,
      ease: EASE_STANDARD_OUT,
      onComplete: () => setControlsReady(true),
    }, 0)
    tl.to(
      checkmark,
      {
        opacity: 1,
        scale: 1,
        duration: CHECKMARK_ENTER_S,
        ease: EASE_SPRING_ENTER,
      },
      enterS,
    )

    return () => {
      tl.kill()
      gsap.killTweensOf([root, ...content])
    }
  }, [isOpen, mounted])

  if (!mounted) return null

  const node = (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      className="fixed inset-0 mx-auto flex w-full max-w-[var(--shell-width)] flex-col bg-special-brand-alt"
      style={{
        zIndex: Z_CLAIM_SUCCESS,
        minHeight: "var(--app-h)",
        // While open, sit above Vaul's body `pointer-events: none`. On dismiss,
        // release so Check in on the claimed page underneath is tappable.
        pointerEvents: isOpen ? "auto" : "none",
      }}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close and return to restaurant"
        onClick={handleClose}
        {...(controlsReady ? {} : { inert: true as const })}
        className="absolute left-4 top-[max(1.5rem,var(--safe-area-top))] z-30 flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-static-key-light p-0 text-static-key-dark shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary opacity-0"
      >
        <Cross size="md" className="text-static-key-dark" aria-hidden />
      </button>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 pb-3 pt-6">
        <img
          ref={checkmarkRef}
          src={CLAIM_OFFER_CLAIMED_CHECKMARK_SRC}
          alt=""
          width={180}
          height={180}
          decoding="async"
          draggable={false}
          className="size-[180px] shrink-0 object-cover opacity-0"
        />
        <div
          ref={copyRef}
          className="flex w-full flex-col items-center gap-1 text-center opacity-0"
        >
          <h1 id={titleId} className="m-0 p-0">
            <Typography
              variant="heading-m-accent"
              as="span"
              align="center"
              inlineStyle={TITLE_STYLE}
            >
              {CLAIM_OFFER_SUCCESS_TITLE}
            </Typography>
          </h1>
          <p id={subtitleId} className="m-0 p-0">
            <Typography
              variant="body-l-regular"
              as="span"
              align="center"
              inlineStyle={SUBTITLE_STYLE}
            >
              {arrivalSubtitle}
            </Typography>
          </p>
        </div>
      </div>

      <div
        ref={ctaRef}
        className="flex shrink-0 flex-col px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4 opacity-0"
        {...(controlsReady ? {} : { inert: true as const })}
      >
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          onClick={onDone}
        >
          {CLAIM_OFFER_SUCCESS_CTA}
        </Button>
      </div>
    </div>
  )

  return container ? createPortal(node, container) : node
}
