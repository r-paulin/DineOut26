import boltDineOutLogoUrl from "@/features/offers/assets/bolt-dineout-logo.png"

/** Figma `_LC -- Bolt DineOut Logo` — 203×37 centered wordmark. */
export function BoltDineOutLogo() {
  return (
    <img
      alt=""
      src={boltDineOutLogoUrl}
      width={203}
      height={37}
      className="h-[37px] w-[203px] shrink-0 object-contain"
      aria-hidden
    />
  )
}
