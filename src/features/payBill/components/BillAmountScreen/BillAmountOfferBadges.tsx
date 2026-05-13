import { Typography } from "@bolteu/kalep-react"
import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Plus from "@bolteu/kalep-react-icons/dist/Plus"
import type { PayBillAmountBadges } from "@/features/payBill/payBill.types"

export interface BillAmountOfferBadgesProps {
  badges: PayBillAmountBadges | undefined
}

function Pill({ label }: { label: string }) {
  return (
    <span className="pointer-events-none inline-flex h-6 max-w-full shrink-0 items-center gap-1 rounded-full bg-neutral-secondary py-0.5 pl-1.5 pr-2">
      <Offer size="xs" className="shrink-0 text-action-primary" aria-hidden />
      <Typography
        variant="body-xs-accent"
        as="span"
        noWrap
        inlineStyle={{
          fontVariationSettings: "'wght' var(--font-weight-semibold, 650)",
          color: "var(--color-static-content-key-dark, #000)",
        }}
      >
        {label}
      </Typography>
    </span>
  )
}

/**
 * Figma offer pills under bill amount: default, optional plus, claimed.
 */
export function BillAmountOfferBadges({ badges }: BillAmountOfferBadgesProps) {
  if (!badges) return null
  const { defaultLabel, claimedLabel } = badges
  const hasDefault = Boolean(defaultLabel?.trim())
  const hasClaimed = Boolean(claimedLabel?.trim())
  if (!hasDefault && !hasClaimed) return null

  return (
    <div className="flex w-full justify-center px-6 pt-3">
      <div className="flex max-w-full flex-wrap items-center justify-center gap-[8px]">
        {hasDefault ?
          <Pill label={defaultLabel!.trim()} />
        : null}
        {hasDefault && hasClaimed ?
          <Plus size="md" className="shrink-0 text-secondary" aria-hidden />
        : null}
        {hasClaimed ?
          <Pill label={claimedLabel!.trim()} />
        : null}
      </div>
    </div>
  )
}
