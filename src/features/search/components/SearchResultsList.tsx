import { Fragment, type ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import Star from "@bolteu/kalep-react-icons/dist/Star"
import { OfferCardBadges } from "@/features/offers"
import { computeOfferCardCampaignForSlug } from "@/features/offers/utils/offerCampaign"
import type { SearchResultRigaRow } from "@/features/search/data/searchResultsRiga"

export interface SearchResultsListProps {
  rows: SearchResultRigaRow[]
  /** When set, replaces the default “N restaurants” heading above the cards. */
  lead?: ReactNode
  onRestaurantPress?: (slug: string) => void
}

function restaurantCountLabel(count: number): string {
  if (count === 1) return "1 restaurant"
  return `${count} restaurants`
}

/**
 * Search / section “match” list: photo grid, badges, venue meta (Figma
 * `_Place / Card / XL` + `_Content / Restaurants list` 15736:22697).
 */
export function SearchResultsList({
  rows,
  lead,
  onRestaurantPress,
}: SearchResultsListProps) {
  const defaultLead = (
    <Typography as="h2" variant="heading-m-accent" color="primary">
      {restaurantCountLabel(rows.length)}
    </Typography>
  )

  return (
    <div className="flex flex-col gap-4 pt-3 w-full">
      {lead !== undefined ? lead : defaultLead}
      <div className="flex flex-col gap-5 pb-7">
        {rows.map((row) => (
          <Fragment key={row.id}>
            <button
              type="button"
              className="flex flex-col gap-3 w-full border-none bg-transparent p-0 text-left cursor-pointer"
              onClick={() => onRestaurantPress?.(row.restaurantSlug)}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.58fr)] grid-rows-[13.75rem] gap-3 w-full items-stretch">
                <div className="relative w-full h-full min-h-0 rounded-xl overflow-hidden bg-neutral-secondary">
                  <img
                    className="w-full h-full object-cover object-center block"
                    src={row.primaryImage}
                    alt=""
                    loading="lazy"
                  />
                  {row.primaryGrad ? (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0) 53.5%, rgba(0,0,0,0.5) 100%)",
                      }}
                      aria-hidden
                    />
                  ) : null}
                  <div className="absolute left-1 top-1 z-[1] flex flex-col gap-0.5 items-start p-2 max-w-[70%]">
                    <OfferCardBadges
                      campaign={computeOfferCardCampaignForSlug(
                        row.restaurantSlug,
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-rows-[1fr_1fr] gap-3 min-h-0 h-full">
                  <div className="min-h-0 rounded-xl overflow-hidden bg-neutral-secondary">
                    <img
                      className="w-full h-full object-cover object-center block"
                      src={row.sideTop}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="min-h-0 rounded-xl overflow-hidden bg-neutral-secondary">
                    <img
                      className="w-full h-full object-cover object-center block"
                      src={row.sideBottom}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 pt-0 pb-6">
                <Typography
                  as="h3"
                  variant="heading-s-accent"
                  inlineStyle={{ letterSpacing: "-0.03rem" }}
                >
                  {row.name}
                </Typography>
                <div className="flex flex-wrap items-center gap-1 text-sm leading-5 -tracking-[0.00525rem] text-primary">
                  <span className="flex items-center gap-1">
                    <Star
                      size="lg"
                      className="shrink-0 block text-[#FFB200]"
                    />
                    <span className="[font-variation-settings:'wght'_var(--font-weight-semibold)]">
                      {row.rating}
                    </span>
                    {row.reviewSuffix ? (
                      <span className="[font-variation-settings:'wght'_var(--font-weight-regular)]">
                        {row.reviewSuffix}
                      </span>
                    ) : null}
                  </span>
                  <span className="mx-0.5" aria-hidden>
                    ·
                  </span>
                  <span>{row.displayPrice}</span>
                  <span className="mx-0.5" aria-hidden>
                    ·
                  </span>
                  <span>{row.area}</span>
                </div>
                <span title={row.tagDescription}>
                  <Typography
                    variant="body-s-regular"
                    color="secondary"
                    inlineStyle={{ letterSpacing: "-0.00525rem" }}
                  >
                    {row.cuisine}
                  </Typography>
                </span>
              </div>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
