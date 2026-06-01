import { Typography } from "@bolteu/kalep-react"
import dineoutCashbackCoinUrl from "@/features/offers/assets/dineout-cashback-coin.png"
import { DINEOUT_CASHBACK_COIN_SLOT_PX } from "@/features/offers/constants/dineoutCashbackCoinLayout"
import {
  DINEOUT_CASHBACK_BANNER_PRIMARY,
  formatDineOutClaimCashbackBannerSecondary,
} from "@/features/offers/constants/dineOutStackablePromo"

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface DineOutCashbackBannerProps {
  /** Cashback percent for the secondary line (defaults to product default). */
  cashbackPercent?: number
  className?: string
}

/**
 * Figma `_Cashback` (`16388:31188`) — inline DineOut cashback promo card.
 * Used in claim and claimed-offer payment method flows.
 */
/** Figma `_Cashback` coin frame — 56×56 clip with proportional zoom (no skew). */
const COIN_IMAGE_CLASS =
  "absolute max-w-none size-[194.47%] left-[-62.79%] top-[-47.22%]"

export function DineOutCashbackBanner({
  cashbackPercent,
  className,
}: DineOutCashbackBannerProps) {
  const secondary = formatDineOutClaimCashbackBannerSecondary(cashbackPercent)

  return (
    <div className={className}>
      <div className="relative min-h-[56px] min-w-[15rem] w-full overflow-hidden rounded-[12px] bg-action-secondary py-2 pl-16 pr-3">
        <div
          className="pointer-events-none absolute bottom-0 left-0 overflow-hidden"
          style={{
            width: DINEOUT_CASHBACK_COIN_SLOT_PX,
            height: DINEOUT_CASHBACK_COIN_SLOT_PX,
          }}
          aria-hidden
        >
          <img
            src={dineoutCashbackCoinUrl}
            alt=""
            decoding="async"
            draggable={false}
            className={COIN_IMAGE_CLASS}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography
            as="p"
            variant="body-s-accent"
            color="primary"
            inlineStyle={{ ...SEMIBOLD, fontFeatureSettings: FONT_FEAT }}
          >
            {DINEOUT_CASHBACK_BANNER_PRIMARY}
          </Typography>
          <Typography
            as="p"
            variant="body-s-regular"
            color="primary"
            inlineStyle={{ fontFeatureSettings: FONT_FEAT }}
          >
            {secondary}
          </Typography>
        </div>
      </div>
    </div>
  )
}
