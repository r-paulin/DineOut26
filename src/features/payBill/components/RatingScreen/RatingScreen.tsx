import { Button, IconButton, Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import gsap from "gsap"
import { useCallback, useRef, useState } from "react"
import feedbackHandUrl from "@/features/payBill/assets/feedback-hand-holding-dish.png"
import { submitOfferRating } from "@/features/payBill/api/payBill.api"
import { RatingFeedbackField } from "@/features/payBill/components/RatingScreen/RatingFeedbackField"
import { StarRating } from "@/features/payBill/components/RatingScreen/StarRating"
import {
  useRatingScreenHeroEntrance,
  useRatingScreenRevealOnStars,
} from "@/features/payBill/hooks/useRatingScreenAnimations"
import { prefersReducedMotion } from "@/shared/utils/prefersReducedMotion"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface RatingScreenProps {
  restaurantName: string
  offerId: string
  onClose: () => void
  onSubmitDone: () => void
}

const MIN_H = 56
const MAX_H = 168
const LINE = 24

/**
 * Post-pay rating — Figma `15825:12275` / `15825:12393`: full-width column, stars + optional
 * feedback in scroll region, Done pinned under (same shell width as payment confirmation).
 */
export function RatingScreen({
  restaurantName,
  offerId,
  onClose,
  onSubmitDone,
}: RatingScreenProps) {
  const [stars, setStars] = useState(0)
  const [text, setText] = useState("")
  const heroRef = useRef<HTMLDivElement>(null)
  const revealedRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useRatingScreenHeroEntrance(heroRef)
  useRatingScreenRevealOnStars(revealedRef, stars)

  const onChangeText = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value.slice(0, 1000)
      setText(v)
      const el = wrapRef.current
      if (!el || stars < 1 || prefersReducedMotion()) return
      const lines = Math.min(7, Math.max(1, v.split("\n").length))
      const target = Math.min(MAX_H, Math.max(MIN_H, lines * LINE))
      gsap.to(el, { height: target, duration: 0.2, ease: "power1.out" })
    },
    [stars],
  )

  const submit = useCallback(() => {
    if (stars < 1) return
    submitOfferRating(offerId, {
      rating: stars,
      feedback: text.trim() === "" ? null : text.trim(),
    })
    onSubmitDone()
  }, [offerId, onSubmitDone, stars, text])

  return (
    <div className="flex h-[var(--app-h)] max-h-[var(--app-h)] w-full flex-col overflow-hidden bg-layer-floor-1">
      <header className="flex shrink-0 items-center gap-2.5 px-3.5 pb-3 pt-[max(1.5rem,var(--safe-area-top))] pr-16">
        <IconButton
          variant="secondary"
          aria-label="Close"
          icon={<Cross size="md" className="text-primary" aria-hidden />}
          size="sm"
          onClick={onClose}
          overrideClassName="size-10 shrink-0 rounded-full border-0 bg-static-key-light p-0 shadow-[0px_2px_3px_rgba(0,0,0,0.16)] hover:bg-active-neutral-secondary"
        />
        <div className="min-h-[24px] min-w-0 flex-1 text-center">
          <Typography
            variant="body-l-accent"
            color="primary"
            as="p"
            align="center"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {restaurantName}
          </Typography>
        </div>
        <span className="size-10 shrink-0" aria-hidden />
      </header>

      <div className="flex min-h-0 flex-1 flex-col px-6">
        <div
          className={
            stars < 1 ?
              "flex min-h-0 flex-1 flex-col justify-center overflow-y-auto"
            : "flex min-h-0 flex-1 flex-col overflow-y-auto pt-2"
          }
        >
          <div className="flex w-full flex-col items-center gap-6 pb-4">
            <div ref={heroRef} className="size-[180px] shrink-0">
              <img
                src={feedbackHandUrl}
                alt=""
                width={180}
                height={180}
                draggable={false}
                className="size-full object-contain"
              />
            </div>
            <div className="flex w-full flex-col gap-1 text-center">
              <Typography
                variant="heading-s-accent"
                color="primary"
                align="center"
                as="h1"
                lines={3}
                inlineStyle={{
                  fontVariationSettings: "'wght' var(--font-weight-semibold)",
                  fontFeatureSettings: FONT_FEAT,
                }}
              >
                How did you enjoy the food and service?
              </Typography>
              <Typography variant="body-m-regular" color="secondary" align="center" as="p">
                Tell us what you liked — or what could be better.
              </Typography>
            </div>
            <StarRating value={stars} onChange={setStars} />
            {stars > 0 ?
              <div ref={revealedRef} className="w-full shrink-0">
                <RatingFeedbackField
                  heightClipRef={wrapRef}
                  value={text}
                  onChange={onChangeText}
                />
              </div>
            : null}
          </div>
        </div>

        {stars > 0 ?
          <div className="shrink-0 pb-[max(1.5rem,var(--safe-area-bottom))] pt-3">
            <Button
              variant="primary"
              fullWidth
              overrideClassName="!h-14 !min-h-14 rounded-full"
              onClick={submit}
            >
              Done
            </Button>
          </div>
        : null}
      </div>
    </div>
  )
}
