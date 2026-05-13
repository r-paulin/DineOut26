import { useEffect, useState } from "react"

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** Hours + minutes + seconds, e.g. `1h 05m 09s`, `59m 00s`, or `45s`. */
export function formatCountdownHoursMinutes(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const totalMinutes = Math.floor(s / 60)
  const sec = s % 60
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h > 0) {
    return `${h}h ${pad2(m)}m ${pad2(sec)}s`
  }
  if (m > 0) {
    return `${m}m ${pad2(sec)}s`
  }
  return `${sec}s`
}

/** Total minutes and seconds, e.g. `59:20` — updates every second when used as live text. */
export function formatCountdownMmSs(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSeconds / 60)
  const sec = totalSeconds % 60
  return `${m}:${pad2(sec)}`
}

/**
 * Banner / claimed-offer row: `1h 05m 12s` when ≥60 minutes left, otherwise `M:SS`
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
} {
  const end = new Date(closeIso).getTime()
  if (!Number.isFinite(end)) {
    return {
      expired: true,
      countdownHm: "0s",
      countdownMmSs: "0:00",
      countdownLive: "0:00",
    }
  }
  const remaining = end - Date.now()
  const expired = remaining <= 0
  return {
    expired,
    countdownHm: formatCountdownHoursMinutes(remaining),
    countdownMmSs: formatCountdownMmSs(remaining),
    countdownLive: formatOfferCountdownLive(remaining),
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
  /** Prefer in UI: includes seconds; under 1h remaining uses `M:SS`. */
  countdownLive: string
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
