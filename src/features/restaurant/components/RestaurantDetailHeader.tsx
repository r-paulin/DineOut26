import { useState } from "react"
import { Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
import ShareIosOutlined from "@bolteu/kalep-react-icons/dist/ShareIosOutlined"
import type { RestaurantHeroStatusPill } from "@/features/restaurant/utils/restaurantOpenHoursUi"

const HERO_MIN_H = 274
const HERO_GRAD =
  "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.1) 25.5%, rgba(0,0,0,0.75))"

export interface RestaurantDetailHeaderProps {
  name: string
  heroImageUrl: string
  logoCandidates: string[]
  logoFallbackUrl?: string
  statusPill: RestaurantHeroStatusPill
  titleOpacity: number
  onBack: () => void
  onShare?: () => void
  /** Opens working-hours sheet (hero status pill). */
  onOpenHours?: () => void
}

/** Figma: white circular controls — use Kalep static key fill (not `bg-neutral-white`, which is not in the Tailwind palette). */
const NAV_BTN =
  "inline-flex size-10 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full border-none bg-static-key-light p-0 leading-none shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)] [&_svg]:block [&_svg]:shrink-0"

/** Three-column chrome: fixed 40px side tracks so back/share stay aligned (incl. Firefox mobile). */
const NAV_ROW =
  "grid w-full grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-x-2 px-6"

export function RestaurantDetailHeader({
  name,
  heroImageUrl,
  logoCandidates,
  logoFallbackUrl,
  statusPill,
  titleOpacity,
  onBack,
  onShare,
  onOpenHours,
}: RestaurantDetailHeaderProps) {
  const [attempt, setAttempt] = useState(0)
  const [usingLogoFallback, setUsingLogoFallback] = useState(false)

  const hasCandidates = logoCandidates.length > 0
  const activeSrc =
    usingLogoFallback && logoFallbackUrl
      ? logoFallbackUrl
      : hasCandidates && attempt < logoCandidates.length
        ? logoCandidates[attempt]!
        : (logoFallbackUrl ?? logoCandidates[0] ?? "")

  return (
    <header
      className="relative flex w-full min-h-0 shrink-0 flex-col overflow-hidden bg-neutral-secondary"
      style={{ minHeight: HERO_MIN_H }}
    >
      <img
        src={heroImageUrl}
        alt=""
        className="absolute inset-0 h-full min-h-[274px] w-full object-cover"
      />
      <div
        className="absolute inset-0 min-h-[274px] pointer-events-none"
        style={{ background: HERO_GRAD }}
        aria-hidden
      />
      <div className="sticky top-0 z-[2] w-full shrink-0 pt-[max(1.5rem,var(--safe-area-top))]">
        <div className={NAV_ROW}>
        <button
          type="button"
          className={`${NAV_BTN} justify-self-start text-static-key-dark`}
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft size="md" className="text-static-key-dark" aria-hidden />
        </button>
        <div
          className="flex min-h-10 min-w-0 items-center justify-center overflow-hidden px-2 text-center text-static-key-light"
          style={{ opacity: titleOpacity }}
        >
          <Typography
            variant="heading-m-accent"
            color="primary-inverted"
            as="span"
            noWrap
          >
            {name}
          </Typography>
        </div>
        {onShare ?
          <button
            type="button"
            className={`${NAV_BTN} justify-self-end text-static-key-dark`}
            onClick={onShare}
            aria-label="Share"
          >
            <ShareIosOutlined size="md" className="text-static-key-dark" aria-hidden />
          </button>
        : <span className="size-10 shrink-0 justify-self-end" aria-hidden />}
        </div>
      </div>
      <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-6">
        <div className="mb-3 h-16 w-16 shrink-0 overflow-hidden rounded-[12px] border border-white/20 bg-neutral-secondary shadow-md">
          <img
            src={activeSrc}
            alt=""
            className={`h-full w-full ${
              usingLogoFallback ? "object-cover" : "object-contain"
            }`}
            onError={() => {
              if (!hasCandidates) return
              if (attempt < logoCandidates.length - 1) {
                setAttempt((a) => a + 1)
              } else if (logoFallbackUrl && !usingLogoFallback) {
                setUsingLogoFallback(true)
              }
            }}
          />
        </div>
        <div className="flex flex-col items-center">
          <h1
            className="m-0 max-w-full text-center text-static-key-light [font-variation-settings:'wght'_var(--font-weight-semibold)]"
            style={{
              fontFamily: "var(--font-family)",
              fontSize: "28px",
              lineHeight: "2rem",
              letterSpacing: "-0.02em",
            }}
          >
            {name}
          </h1>
          {onOpenHours ?
            <button
              type="button"
              className="inline-flex max-w-full cursor-pointer flex-wrap items-center justify-center gap-0 rounded-full border-none bg-special-scrim py-1 pl-2 pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
              onClick={() => {
                onOpenHours()
              }}
              aria-label={statusPill.ariaLabel}
            >
              <Typography variant="body-s-regular" color="primary-inverted" as="span">
                {statusPill.primary}
              </Typography>
              {statusPill.showSecondary && statusPill.secondary ?
                <>
                  <span
                    className="mx-0.5 text-primary-inverted opacity-64"
                    aria-hidden
                  >
                    ·
                  </span>
                  <Typography variant="body-s-regular" color="primary-inverted" as="span">
                    {statusPill.secondary}
                  </Typography>
                </>
              : null}
              <ChevronRight
                size="sm"
                className="ml-0.5 shrink-0 text-primary-inverted"
                aria-hidden
              />
            </button>
          : <div
              className="inline-flex max-w-full flex-wrap items-center justify-center gap-0 rounded-full bg-special-scrim py-1 pl-2 pr-1"
              role="status"
              aria-label={statusPill.ariaLabel}
            >
              <Typography variant="body-s-regular" color="primary-inverted" as="span">
                {statusPill.primary}
              </Typography>
              {statusPill.showSecondary && statusPill.secondary ?
                <>
                  <span
                    className="mx-0.5 text-primary-inverted opacity-64"
                    aria-hidden
                  >
                    ·
                  </span>
                  <Typography variant="body-s-regular" color="primary-inverted" as="span">
                    {statusPill.secondary}
                  </Typography>
                </>
              : null}
            </div>
          }
        </div>
      </div>
    </header>
  )
}
