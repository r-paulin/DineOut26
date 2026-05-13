import { Typography } from "@bolteu/kalep-react"

/**
 * Empty state shown inside the Offers tabpanel when the selected date has
 * no offers. Matches Figma `15877:20275` (Feed / Offers · No offer).
 */
export function RestaurantDetailOffersEmptyState() {
  return (
    <div className="flex w-full flex-col items-center gap-3 py-5 text-center">
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
        No offer posted for this date — check available benefits when paying
        with DineOut.
      </Typography>
    </div>
  )
}
