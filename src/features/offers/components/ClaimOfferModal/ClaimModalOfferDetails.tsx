import { Typography } from "@bolteu/kalep-react"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatClaimModalOfferDetailRows } from "@/features/offers/utils/formatClaimModalOfferDetailRows"
import { CardDivider } from "@/shared/components/CardDivider"

/** Figma Heading XS / XS Accent (`16144:19986`). */
const OFFER_DETAILS_HEADING_CLASS =
  "m-0 p-0 text-primary text-xl font-semibold leading-[1.5625rem] tracking-[-0.02125rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

/** Offer details block (Figma `16144:19972` — Card divider + Heading XS). */
export function ClaimModalOfferDetails({ offer }: { offer: ClaimOfferModalOffer }) {
  const rows = formatClaimModalOfferDetailRows(offer)

  return (
    <div className="flex flex-col">
      <CardDivider />
      <div className="px-6 pb-1 pt-6">
        <h2 className={OFFER_DETAILS_HEADING_CLASS}>Offer details</h2>
      </div>
      <div className="flex flex-col px-6 py-3 pb-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 py-1"
          >
            <Typography variant="body-s-regular" color="secondary" as="span">
              {row.label}
            </Typography>
            <span className="text-right">
              <Typography variant="body-s-regular" color="primary" as="span">
                {row.value}
              </Typography>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
