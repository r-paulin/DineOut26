import { useState } from "react"
import { Typography } from "@bolteu/kalep-react"
import ArrowLeft from "@bolteu/kalep-react-icons/dist/ArrowLeft"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
import ShareIosOutlined from "@bolteu/kalep-react-icons/dist/ShareIosOutlined"

const HERO_MIN_H = 274
const HERO_GRAD =
  "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.1) 25.5%, rgba(0,0,0,0.75))"

export interface RestaurantDetailHeaderProps {
  name: string
  heroImageUrl: string
  logoCandidates: string[]
  logoFallbackUrl?: string
  isOpen: boolean
  closesAt: string
  titleOpacity: number
  onBack: () => void
  onShare?: () => void
  /** Opens the full About screen (hero “Open · Closes …” pill). */
  onOpenAbout?: () => void
}

/** Figma: white circular controls — use Kalep static key fill (not `bg-neutral-white`, which is not in the Tailwind palette). */
const NAV_BTN =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-static-key-light shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.16)]"

export function RestaurantDetailHeader({
  name,
  heroImageUrl,
  logoCandidates,
  logoFallbackUrl,
  isOpen,
  closesAt,
  titleOpacity,
  onBack,
  onShare,
  onOpenAbout,
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
      className="relative w-full shrink-0 overflow-hidden bg-neutral-secondary"
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
      <div className="sticky top-0 z-[2] flex w-full items-start justify-between px-4 pt-6">
        <button
          type="button"
          className={`${NAV_BTN} text-static-key-dark`}
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size="md" className="text-static-key-dark" />
        </button>
        <div
          className="flex min-w-0 flex-1 justify-center overflow-hidden px-2 text-center text-static-key-light"
          style={{ opacity: titleOpacity }}
        >
          <Typography
            variant="body-m-accent"
            color="primary-inverted"
            as="span"
            noWrap
          >
            {name}
          </Typography>
        </div>
        <button
          type="button"
          className={`${NAV_BTN} text-static-key-dark`}
          onClick={onShare}
          aria-label="Share"
        >
          <ShareIosOutlined size="md" className="text-static-key-dark" />
        </button>
      </div>
      <div className="relative z-[1] flex min-h-[200px] flex-col items-center justify-end px-6 pb-6 pt-16">
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
        <div className="flex flex-col items-center gap-1">
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
          <button
            type="button"
            className="flex max-w-full cursor-pointer items-center gap-1 rounded-full border-none bg-transparent px-1 py-0.5 text-left"
            onClick={() => {
              onOpenAbout?.()
            }}
            aria-label="About this restaurant"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 text-sm font-medium text-static-key-light">
                {isOpen ? "Open" : "Closed"}
              </span>
              {isOpen ? (
                <>
                  <span
                    className="mx-0.5 inline-block h-1 w-1 shrink-0 self-center rounded-full bg-[rgba(255,255,255,0.55)]"
                    aria-hidden
                  />
                  <span className="min-w-0 text-sm text-static-key-light">
                    Closes {closesAt}
                  </span>
                </>
              ) : null}
            </span>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[99px] bg-black/25 backdrop-blur-sm"
              aria-hidden
            >
              <ChevronRight size="sm" className="text-static-key-light" />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
