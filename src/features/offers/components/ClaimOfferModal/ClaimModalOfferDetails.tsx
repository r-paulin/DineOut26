import { Typography } from "@bolteu/kalep-react"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import { formatClaimModalOfferDetailRows } from "@/features/offers/utils/formatClaimModalOfferDetailRows"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export function ClaimModalOfferDetails({ offer }: { offer: ClaimOfferModalOffer }) {
  const rows = formatClaimModalOfferDetailRows(offer)

  return (
    <div className="flex flex-col px-6 pb-3 pt-3">
      <div className="pb-1">
        <Typography
          variant="heading-xs-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          Offer details
        </Typography>
      </div>
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
  )
}
