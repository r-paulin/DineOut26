import { Typography } from "@bolteu/kalep-react"

/** Figma `15877:20275` — discount badge illustration. */
const EMPTY_ILLUSTRATION_SRC = "/images/restaurant-offers-empty.png"

/**
 * Empty state shown inside the Offers tabpanel when the selected date has
 * no offers. Matches Figma `15877:20275` (Feed / Offers · No offer).
 */
export function RestaurantDetailOffersEmptyState() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-5 text-center">
      <img
        src={EMPTY_ILLUSTRATION_SRC}
        alt=""
        width={56}
        height={56}
        className="block size-14 object-contain"
        loading="lazy"
        decoding="async"
      />
      <Typography
        variant="body-l-compact-accent"
        color="primary"
        as="p"
        inlineStyle={{
          fontWeight: 600,
          // Body sets inherited `font-variation-settings: "wght" …`; Kalep accent
          // tokens only set `opsz`, so wght can stay regular unless overridden.
          fontVariationSettings: '"opsz" 18, "wght" 600',
        }}
      >
        No offers on this day
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        There are currently no offers in this venue. Try another location or
        check back soon.
      </Typography>
    </div>
  )
}
