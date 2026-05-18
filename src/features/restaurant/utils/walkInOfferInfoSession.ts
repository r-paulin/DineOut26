const SESSION_KEY = "dineout:walk-in-offer-info-seen"

/** Whether the walk-in offer info sheet was already shown this browser tab session. */
export function hasSeenWalkInOfferInfoThisSession(): boolean {
  if (typeof sessionStorage === "undefined") return false
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1"
  } catch {
    return false
  }
}

export function markWalkInOfferInfoSeenThisSession(): void {
  if (typeof sessionStorage === "undefined") return
  try {
    sessionStorage.setItem(SESSION_KEY, "1")
  } catch {
    /* quota / private mode */
  }
}
