import { Typography } from "@bolteu/kalep-react"
import { OfferBanner } from "@/features/restaurant/components/OfferBanner/OfferBanner"
import type { RestaurantBenefitRowModel } from "@/features/restaurant/restaurantDetail.types"

export interface RestaurantDetailBenefitsSectionProps {
  benefits: RestaurantBenefitRowModel[]
  /** When set, each row is a button that reports its {@link RestaurantBenefitRowModel.id}. */
  onBenefitRowPress?: (benefitId: string) => void
}

/**
 * Figma `16084:50144` — static offer banners; reuses {@link OfferBannerMiniBannerImg}
 * unclaimed seal (`16084:49936`), same as claimable offer rows.
 */
export function RestaurantDetailBenefitsSection({
  benefits,
  onBenefitRowPress,
}: RestaurantDetailBenefitsSectionProps) {
  return (
    <section className="flex w-full flex-col gap-4 px-6 py-6" aria-label="More benefits">
      <Typography
        variant="heading-xs-accent"
        color="primary"
        as="h2"
        inlineStyle={{
          fontVariationSettings: "'wght' var(--font-weight-semibold)",
        }}
      >
        More benefits for you
      </Typography>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {benefits.map((b) => (
          <li key={b.id} className="relative w-full min-w-0 list-none p-0">
            <OfferBanner
              presentation="static"
              title={b.title}
              subtitle={b.subtitle}
              onPress={
                onBenefitRowPress ?
                  () => onBenefitRowPress(b.id)
                : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
