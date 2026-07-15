import { useEffect, useState } from "react"
import { getRestaurantOffers } from "@/features/offers/data/restaurantOffers.data"
import type {
  RestaurantTimedOffer,
  TimedOfferWindow,
} from "@/features/offers/data/restaurantOffers.types"

/** Minutes before window start when the campaign PercentFlower turns red (Figma). */
export const OFFER_ICON_PRE_START_GRACE_MINUTES = 15

/** Figma `19206:45778` Map pin / Discount — Normal / Selected / Closed. */
export type OfferCampaignSurface =
  | "cardBadge"
  | "mapPin"
  | "mapPinSelected"
  | "mapPinClosed"

const ICON_SHRINK = "shrink-0"

const MAP_PIN_DISCOUNT_TEXT =
  "text-sm leading-5 -tracking-[0.00525rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

/**
 * Figma Closed / washed pin — opaque white base, then 13% wash on top.
 * Do not use a lone translucent fill: the map would show through.
 * (`bg-[gradient,#fff]` is unreliable in Tailwind; set color + image separately.)
 */
export const MAP_PIN_WASHED_PILL_CLASS =
  "border-2 border-solid border-[var(--color-layer-floor-2,#fff)] bg-[var(--layer-floor-1,#fff)] [background-image:linear-gradient(90deg,rgba(0,31,24,0.13),rgba(0,31,24,0.13))]"

export function getOfferCampaignPillClass(surface: OfferCampaignSurface): string {
  if (surface === "mapPinSelected") return "bg-neutral-primary"
  if (surface === "mapPinClosed") return MAP_PIN_WASHED_PILL_CLASS
  return "bg-layer-floor-1"
}

/** Card-badge icon on unified white pill — no inner chip (Figma `16390:34941`). */
export function getOfferCampaignIconChipClass(
  _surface: OfferCampaignSurface,
  _iconActive: boolean,
  _comfortable: boolean,
): string | null {
  return null
}

export function getOfferCampaignIconClass(
  surface: OfferCampaignSurface,
  iconActive: boolean,
): string {
  if (surface === "mapPinSelected") {
    return `${ICON_SHRINK} text-primary-inverted`
  }
  if (surface === "mapPinClosed") {
    return `${ICON_SHRINK} text-tertiary`
  }
  if (surface === "mapPin") {
    return iconActive ?
        `${ICON_SHRINK} text-primary`
      : `${ICON_SHRINK} text-tertiary`
  }
  if (!iconActive) {
    return `${ICON_SHRINK} text-tertiary`
  }
  return `${ICON_SHRINK} text-danger-primary`
}

export function getOfferCampaignDiscountTextClass(
  surface: OfferCampaignSurface,
): string {
  if (surface === "mapPinSelected") {
    return `${MAP_PIN_DISCOUNT_TEXT} text-primary-inverted`
  }
  if (surface === "mapPinClosed") {
    return `${MAP_PIN_DISCOUNT_TEXT} text-tertiary`
  }
  if (surface === "mapPin") {
    return `${MAP_PIN_DISCOUNT_TEXT} text-primary`
  }
  return ""
}

const BADGE_TEXT_SEMIBOLD =
  "[font-variation-settings:'wght'_var(--font-weight-semibold)]"

export function getOfferCampaignBadgeMainTextClass(comfortable: boolean): string {
  const size =
    comfortable ?
      "text-sm leading-5 whitespace-nowrap"
    : "text-xs leading-4 whitespace-nowrap"
  return `${size} ${BADGE_TEXT_SEMIBOLD} text-static-key-light`
}

export function getOfferCampaignBadgeDotTextClass(comfortable: boolean): string {
  const size =
    comfortable ? "text-sm leading-5 shrink-0" : "text-xs leading-4 shrink-0"
  return `${size} ${BADGE_TEXT_SEMIBOLD} text-static-key-light`
}

/** Time segment on card badges (Figma `15735:21955`). */
export function getOfferCampaignBadgeTimeTextClass(comfortable: boolean): string {
  return comfortable ?
      "text-sm leading-5 font-normal whitespace-nowrap"
    : "text-xs leading-4 font-normal whitespace-nowrap"
}

export const OFFER_CAMPAIGN_BADGE_TIME_STYLE = {
  color: "var(--color-static-content-secondary-light)",
} as const

const OFFER_DISPLAY_CLOCK_TICK_MS = 30_000

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + (Number.isFinite(m) ? m : 0)
}

function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/**
 * True when `minutesFromMidnight` lies in [start − grace, end) for ranged offers;
 * `all-day` is always display-active.
 */
export function timedOfferWindowDisplayActiveAtMinutes(
  minutesFromMidnight: number,
  window: TimedOfferWindow,
  graceMinutes = OFFER_ICON_PRE_START_GRACE_MINUTES,
): boolean {
  if (window.kind === "all-day") return true
  const start = hhmmToMinutes(window.start)
  const end = hhmmToMinutes(window.end)
  const graceStart = start - graceMinutes
  if (end < start) {
    return minutesFromMidnight >= graceStart || minutesFromMidnight < end
  }
  return minutesFromMidnight >= graceStart && minutesFromMidnight < end
}

export function isTimedOfferDisplayActive(
  offer: RestaurantTimedOffer,
  now: Date,
): boolean {
  return timedOfferWindowDisplayActiveAtMinutes(
    minutesFromMidnight(now),
    offer.window,
  )
}

/**
 * True if any timed offer for `slug` is display-active (includes pre-start grace).
 * Used for map pin icon color — separate from strict discover “open now” filters.
 */
export function restaurantTimedOfferDisplayActiveNow(
  slug: string,
  now: Date,
): boolean {
  const offers = getRestaurantOffers(slug)
  if (offers.length === 0) return false
  const m = minutesFromMidnight(now)
  return offers.some((o) =>
    timedOfferWindowDisplayActiveAtMinutes(m, o.window),
  )
}

/** Parses campaign pill copy (`12:00–15:00`, `All day`) into a timed window. */
export function parseCampaignTimeWindowLabel(
  timeWindow: string | undefined,
): TimedOfferWindow | null {
  if (!timeWindow?.trim() || timeWindow === "All day") {
    return { kind: "all-day" }
  }
  const parts = timeWindow.split(/[–-]/)
  if (parts.length !== 2) return null
  const start = parts[0]!.trim()
  const end = parts[1]!.trim()
  if (!/^\d{1,2}:\d{2}$/.test(start) || !/^\d{1,2}:\d{2}$/.test(end)) {
    return null
  }
  return { kind: "range", start, end }
}

export function campaignTimeWindowDisplayActive(
  timeWindow: string | undefined,
  now: Date,
): boolean {
  const window = parseCampaignTimeWindowLabel(timeWindow)
  if (!window) return true
  return timedOfferWindowDisplayActiveAtMinutes(minutesFromMidnight(now), window)
}

export function offerBadgeIconClass(iconActive: boolean): string {
  return getOfferCampaignIconClass("cardBadge", iconActive)
}

/** Device clock for offer icon color; ticks when timed offers may change state. */
export function useOfferDisplayNow(enabled: boolean): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    if (!enabled) return
    setNow(new Date())
    const id = window.setInterval(() => {
      setNow(new Date())
    }, OFFER_DISPLAY_CLOCK_TICK_MS)
    return () => window.clearInterval(id)
  }, [enabled])

  return now
}
