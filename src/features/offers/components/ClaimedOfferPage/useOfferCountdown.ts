import { useEffect, useState } from "react"

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** Claimed-offer detail row — Figma `Offer window closes 1:59:23` (no “in”). */
export function formatOfferWindowClosesLabel(
  expired: boolean,
  countdownHms: string,
): string {
  return expired ? "Offer expired" : `Offer window closes ${countdownHms}`
}

/** `H:MM:SS` (hours unpadded), e.g. `1:05:09` or `23:40:00`. */
export function formatCountdownHms(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h}:${pad2(m)}:${pad2(s)}`
}

/** Hours + minutes only (no seconds), e.g. `1h 05m` or `59m`. */
export function formatCountdownHoursMinutes(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const totalMinutes = Math.floor(s / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) {
    return `${h}h ${pad2(m)}m`
  }
  return `${m}m`
}

/** Total minutes and seconds, e.g. `59:20` — updates every second when used as live text. */
export function formatCountdownMmSs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${m}:${pad2(sec)}`
}

/**
 * Banner / claimed-offer row: `1h 05m` when ≥60 minutes left, otherwise `M:SS`
 * so the timer ticks every second in the final hour.
 */
export function formatOfferCountdownLive(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (totalMinutes >= 60) {
    return formatCountdownHoursMinutes(ms)
  }
  return formatCountdownMmSs(ms)
}

function compute(closeIso: string): {
  expired: boolean
  countdownHm: string
  countdownMmSs: string
  countdownLive: string
  countdownHms: string
} {
  const end = new Date(closeIso).getTime()
  if (!Number.isFinite(end)) {
    return {
      expired: true,
      countdownHm: "0m",
      countdownMmSs: "0:00",
      countdownLive: "0:00",
      countdownHms: "0:00:00",
    }
  }
  const remaining = end - Date.now()
  const expired = remaining <= 0
  return {
    expired,
    countdownHm: formatCountdownHoursMinutes(remaining),
    countdownMmSs: formatCountdownMmSs(remaining),
    countdownLive: formatOfferCountdownLive(remaining),
    countdownHms: formatCountdownHms(remaining),
  }
}

/**
 * Live countdown to `closeIso` using the device clock. Updates every second;
 * clears interval on unmount.
 */
export function useOfferCountdown(closeIso: string): {
  expired: boolean
  countdownHm: string
  countdownMmSs: string
  /** Prefer in UI: ticks every second when under 1h remaining. */
  countdownLive: string
  /** `H:MM:SS` for banner-style copy (ticks every second at any duration). */
  countdownHms: string
} {
  const [state, setState] = useState(() => compute(closeIso))

  useEffect(() => {
    queueMicrotask(() => {
      setState(compute(closeIso))
    })
    const id = window.setInterval(() => {
      setState(compute(closeIso))
    }, 1000)
    return () => window.clearInterval(id)
  }, [closeIso])

  return state
}
