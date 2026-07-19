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
import { Z_CLAIM_MODAL_CONTENT } from "@/features/restaurant/constants/screenLayers"
import { useModalOverlayLock } from "@/shared/hooks/useModalOverlayLock"
import {
  EASE_EMPHASIZED_ENTER,
  EASE_EMPHASIZED_EXIT,
  MOTION_MICRO_S,
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
const COPY_ENTER_S = 0.4
const CTA_ENTER_S = 0.38
/** Stagger between hero → copy → CTA (iOS success pattern ~80–120ms). */
const STAGGER_S = 0.1

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
 * Enter: staggered fade + scale (spring on checkmark). Got it → claimed offer;
 * X → restaurant (parent wires).
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
  const arrivalSubtitle = formatClaimOfferSuccessArrivalSubtitle(claim)

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  useModalOverlayLock({
    active: isOpen && mounted,
    containerRef: rootRef,
    onEscape: handleClose,
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
      gsap.set([root, ...content], {
        autoAlpha: 1,
        scale: 1,
        clearProps: "transform",
      })
      return
    }

    gsap.set(root, { autoAlpha: 0 })
    gsap.set(close, { autoAlpha: 0 })
    gsap.set(checkmark, {
      autoAlpha: 0,
      scale: 0.72,
      transformOrigin: "50% 50%",
    })
    gsap.set(copy, {
      autoAlpha: 0,
      scale: 0.94,
      transformOrigin: "50% 50%",
    })
    gsap.set(cta, {
      autoAlpha: 0,
      scale: 0.96,
      transformOrigin: "50% 50%",
    })

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([checkmark, copy, cta], { clearProps: "transform" })
      },
    })
    tl.to(
      root,
      { autoAlpha: 1, duration: enterS, ease: EASE_EMPHASIZED_ENTER },
      0,
    )
    tl.to(
      close,
      {
        autoAlpha: 1,
        duration: MOTION_MICRO_S,
        ease: EASE_EMPHASIZED_ENTER,
      },
      MOTION_MICRO_S * 0.4,
    )
    tl.to(
      checkmark,
      {
        autoAlpha: 1,
        scale: 1,
        duration: CHECKMARK_ENTER_S,
        ease: EASE_SPRING_ENTER,
      },
      0.06,
    )
    tl.to(
      copy,
      {
        autoAlpha: 1,
        scale: 1,
        duration: COPY_ENTER_S,
        ease: EASE_EMPHASIZED_ENTER,
      },
      0.06 + STAGGER_S,
    )
    tl.to(
      cta,
      {
        autoAlpha: 1,
        scale: 1,
        duration: CTA_ENTER_S,
        ease: EASE_EMPHASIZED_ENTER,
      },
      0.06 + STAGGER_S * 2,
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
      className="fixed inset-0 mx-auto flex w-full max-w-[var(--shell-width)] flex-col bg-special-brand-alt opacity-0"
      style={{
        zIndex: Z_CLAIM_MODAL_CONTENT,
        minHeight: "var(--app-h)",
      }}
    >
      <button
        ref={closeRef}
        type="button"
        aria-label="Close and return to restaurant"
        onClick={handleClose}
        className="absolute left-4 top-[max(1.5rem,var(--safe-area-top))] z-30 flex size-10 shrink-0 items-center justify-center rounded-full border-none bg-static-key-light p-0 text-static-key-dark shadow-[0px_2px_3px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
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
          className="size-[180px] shrink-0 object-cover"
        />
        <div
          ref={copyRef}
          className="flex w-full flex-col items-center gap-1 text-center"
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
        className="flex shrink-0 flex-col px-6 pb-[max(2rem,var(--safe-area-bottom))] pt-4"
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
