import { Typography } from "@bolteu/kalep-react"
import type { RestaurantBenefitRowModel } from "@/features/restaurant/restaurantDetail.types"

/** Fallback corner badge when `imageUrl` is missing on a benefit row. */
const DEFAULT_BENEFIT_BADGE_SRC = "/images/benefit-discount-badge.png"

export interface RestaurantDetailBenefitsSectionProps {
  benefits: RestaurantBenefitRowModel[]
  /** When set, each row is a button that reports its {@link RestaurantBenefitRowModel.id}. */
  onBenefitRowPress?: (benefitId: string) => void
}

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
        {benefits.map((b) => {
          const rowInner = (
            <>
              <div
                className="pointer-events-none absolute bottom-0 left-0 z-0 h-[52px] w-[52px]"
                aria-hidden
              >
                <img
                  src={b.imageUrl || DEFAULT_BENEFIT_BADGE_SRC}
                  alt=""
                  width={52}
                  height={52}
                  decoding="async"
                  draggable={false}
                  className="block size-full object-contain object-left object-bottom"
                />
              </div>
              <div className="relative z-[1] flex min-w-0 flex-col justify-center gap-0 py-2 pr-3 pl-[52px] text-left">
                <Typography
                  variant="body-s-accent"
                  color="primary"
                  as="span"
                  inlineStyle={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  {b.title}
                </Typography>
                <Typography
                  variant="body-s-regular"
                  color="primary"
                  as="span"
                  inlineStyle={{
                    fontSize: "14px",
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  {b.subtitle}
                </Typography>
              </div>
            </>
          )

          return (
            <li key={b.id} className="relative w-full min-w-0 list-none p-0">
              {onBenefitRowPress ? (
                <button
                  type="button"
                  className="relative w-full min-w-0 cursor-pointer overflow-hidden rounded-lg border-0 bg-[rgba(0,45,30,0.07)] p-0 text-left outline-none ring-inset ring-action-primary focus-visible:ring-2"
                  aria-haspopup="dialog"
                  onClick={() => onBenefitRowPress(b.id)}
                >
                  {rowInner}
                </button>
              ) : (
                <div className="relative w-full min-w-0 overflow-hidden rounded-lg bg-[rgba(0,45,30,0.07)]">
                  {rowInner}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
