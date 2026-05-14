import { Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
import { OfferBannerDiscountSticker } from "@/features/restaurant/components/OfferBanner/OfferBannerDiscountSticker"
import type { RestaurantBenefitRowModel } from "@/features/restaurant/restaurantDetail.types"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Mint ticket fill — matches Figma blob (`#74EFAA` / `--content-action-primary-inverted`). */
const FILL_TICKET_ACTIVE =
  "var(--content-action-primary-inverted, #74EFAA)"
const LABEL_ON_GREEN = "var(--color-static-content-key-dark, #191f1c)"

/**
 * Short label for the ticket sticker — leading `NN%` or first `NN€` in the title.
 */
function benefitTicketLabel(title: string): string {
  const pct = /^(\d+)\s*%/u.exec(title.trim())
  if (pct?.[1]) return `-${pct[1]}%`
  const eur = /(\d+)\s*€/iu.exec(title)
  if (eur?.[1]) return `-${eur[1]}€`
  return "—"
}

export interface RestaurantDetailBenefitsSectionProps {
  benefits: RestaurantBenefitRowModel[]
  /** When set, each row is a button that reports its {@link RestaurantBenefitRowModel.id}. */
  onBenefitRowPress?: (benefitId: string) => void
}

/**
 * Figma `16005:12213` — same shell as claimed {@link OfferBanner}: action-secondary
 * surface, ticket column, “Applied” pill, primary title, secondary line, chevron.
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
        {benefits.map((b) => {
          const stickerLabel = benefitTicketLabel(b.title)
          const rowInner = (
            <>
              <div className="flex w-[72px] shrink-0 flex-col items-center justify-center self-stretch overflow-visible">
                <div className="-rotate-1 flex origin-center items-center justify-center">
                  <OfferBannerDiscountSticker
                    tagFill={FILL_TICKET_ACTIVE}
                    label={stickerLabel}
                    labelColor={LABEL_ON_GREEN}
                  />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 pl-3 pr-1">
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="inline-flex h-5 max-w-fit items-center justify-center gap-0.5 rounded-[4px] bg-special-brand-alt px-1 py-0.5">
                    <CheckCircle
                      className="size-[14px] shrink-0 text-action-primary-inverted"
                      aria-hidden
                    />
                    <Typography
                      variant="body-xs-accent"
                      color="primary-inverted"
                      as="span"
                      inlineStyle={SEMIBOLD}
                    >
                      Applied
                    </Typography>
                  </span>
                  <Typography
                    variant="body-m-accent"
                    color="primary"
                    as="p"
                    lines={3}
                    inlineStyle={SEMIBOLD}
                  >
                    {b.title}
                  </Typography>
                </div>
                <Typography variant="body-xs-regular" color="secondary" as="p">
                  {b.subtitle}
                </Typography>
              </div>
              <div className="flex w-8 shrink-0 items-center justify-center self-center">
                <ChevronRight
                  size="sm"
                  className="text-secondary"
                  aria-hidden
                />
              </div>
            </>
          )

          return (
            <li key={b.id} className="relative w-full min-w-0 list-none p-0">
              {onBenefitRowPress ?
                <button
                  type="button"
                  className="relative flex w-full min-w-0 cursor-pointer items-stretch overflow-hidden rounded-lg border-0 bg-action-secondary p-3 text-left outline-none ring-inset ring-action-primary focus-visible:ring-2"
                  aria-haspopup="dialog"
                  onClick={() => onBenefitRowPress(b.id)}
                >
                  {rowInner}
                </button>
              : <div className="relative flex w-full min-w-0 items-stretch overflow-hidden rounded-lg bg-action-secondary p-3">
                  {rowInner}
                </div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
