# Offer Banner Logic — Dine Out

Follow these state rules exactly. Do not add new states. Do not default to `claimed`.

## Overview

The offer banner appears on every restaurant page. It reflects **this user's claim status for this specific offer**. There are exactly 3 valid states. No other states exist.

The `claimed` state is **opt-in only** — it requires a positive match in the user's own claim records. It must never be a default or fallback value.

## The 3 Banner States

| State | Condition | Interactive |
| --- | --- | --- |
| `available` | User has no claim record for this offer | Opens claiming bottom sheet |
| `expired` | `offer.expiresAt < Date.now()` **or** the offer’s local calendar window has ended (see below), and no claim record | Disabled / non-tappable |
| `claimed` | User has a claim record matching this `offerId` | Opens claimed offer screen |

### The one rule that prevents the bug

```
claimed requires a positive match — it is never a default.
```

If the user has no claim record → show `available` or `expired`. Never `claimed`.

## Local window expiry (device clock)

When `offer.offerScheduleDate` (`"today"` or `YYYY-MM-DD`) and `offer.offerEnd` (`HH:MM`, device-local) are set, the banner is also **`expired`** if:

- the schedule date is **before** today’s local calendar date, or  
- it is **today** and the current local time is **strictly after** the window end (`offerEnd`; `offerStart` is only used when the window crosses midnight).

This is evaluated in `getOfferBannerState` together with `expiresAt`. Omit schedule fields to rely on `expiresAt` only (e.g. API-driven rows without a tab date).

`OfferBanner` ticks every 30s when schedule fields are present so the UI updates after the window passes without leaving the screen.

## State Derivation — Single Source of Truth

Always derive banner state from `getOfferBannerState()`. Do not inline this logic in components.

```ts
type BannerState = "available" | "expired" | "claimed"

interface Offer {
  id: string
  expiresAt: number // Unix ms
  offerScheduleDate?: "today" | string // YYYY-MM-DD
  offerStart?: string
  offerEnd?: string
}

interface UserClaim {
  offerId: string
  claimedAt: number
}

function getOfferBannerState(
  offer: Offer,
  userClaims: UserClaim[],
  now: number = Date.now(),
): BannerState {
  const hasClaim = userClaims.some((c) => c.offerId === offer.id)
  if (hasClaim) return "claimed"
  if (offer.expiresAt < now) return "expired"
  if (isOfferPastByLocalDeviceClock(offer, now)) return "expired"
  return "available"
}
```

## Claim Flow — Step by Step

1. User taps banner (available) → claiming bottom sheet opens.
2. User confirms claim → API call: `POST /offers/:offerId/claim` (or prototype equivalent).
3. On success: close bottom sheet, return to restaurant page, add `{ offerId, claimedAt }` to `userClaims`, banner re-derives to `claimed`, show one-time snackbar.
4. On error: sheet stays open, inline error, do **not** update claim state.

## Snackbar — Shown Once After Claiming

Fires immediately after the bottom sheet closes and the banner transitions to `claimed`.

| Property | Value |
| --- | --- |
| Title | `Offer claimed` |
| Body | `Open it when you arrive and show it to the waiter` |
| Action label | `View offer` |
| Action behaviour | Navigates to claimed offer screen |
| Duration | Auto-dismiss (standard snackbar timeout) |
| Show condition | Only on the transition from `available` → `claimed`. Not on page re-visits. |

Use a one-time flag (e.g. in the claim success handler + ref), not `useEffect` keyed on `bannerState === "claimed"`.

## Common Bugs to Avoid

- **Global `isClaimed` boolean** — wrong; use claims keyed by `offerId`.
- **Defaulting to `claimed`** — wrong; derive with `getOfferBannerState`.
- **Optimistic claim state before API success** — wrong; update only after success.
- **Re-showing snackbar on every visit when claimed** — wrong; one-time after successful claim only.
