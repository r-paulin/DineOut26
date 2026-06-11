import { Typography } from "@bolteu/kalep-react"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"
import dineoutCashbackCoinUrl from "@/features/offers/assets/dineout-cashback-coin.png"
import {
  DINEOUT_CASHBACK_BANNER_MIN_HEIGHT_PX,
  DINEOUT_CASHBACK_BANNER_PADDING_PX,
  DINEOUT_CASHBACK_COIN_SLOT_PX,
} from "@/features/offers/constants/dineoutCashbackCoinLayout"
import {
  DINEOUT_CASHBACK_BANNER_HEADLINE_SUFFIX,
  formatDineOutClaimCashbackBannerAccent,
  formatDineOutClaimCashbackBannerHeadline,
} from "@/features/offers/constants/dineOutStackablePromo"

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const BODY_S_LINE = {
  lineHeight: "var(--body-s-line-height, 20px)",
} as const

export interface DineOutCashbackBannerProps {
  /** Cashback percent for the headline (defaults to product default). */
  cashbackPercent?: number
  /** Optional second line (e.g. restaurant Offers dismissible banner). */
  secondaryText?: string
  /** When set, renders Figma close control (`16672:56696`). */
  onDismiss?: () => void
  className?: string
}

/** Figma `_Cashback Banner (DineOut)` coin frame — right-aligned clip. */
const COIN_IMAGE_CLASS =
  "absolute h-full max-w-none left-[-20.9%] top-[28.73%] w-[150%]"

/**
 * Figma `_Cashback Banner (DineOut)` (`17421:31531`) — payment-method promo card.
 */
export function DineOutCashbackBanner({
  cashbackPercent,
  secondaryText,
  onDismiss,
  className,
}: DineOutCashbackBannerProps) {
  const accent = formatDineOutClaimCashbackBannerAccent(cashbackPercent)
  const headline = formatDineOutClaimCashbackBannerHeadline(cashbackPercent)

  return (
    <div className={className}>
      <div
        className="relative box-border flex min-w-[15rem] w-full flex-col justify-center gap-1 overflow-hidden rounded-[12px] bg-action-secondary"
        style={{
          minHeight: DINEOUT_CASHBACK_BANNER_MIN_HEIGHT_PX,
          paddingLeft: DINEOUT_CASHBACK_BANNER_PADDING_PX.xStart,
          paddingRight: DINEOUT_CASHBACK_BANNER_PADDING_PX.xEnd,
          paddingTop: DINEOUT_CASHBACK_BANNER_PADDING_PX.y,
          paddingBottom: DINEOUT_CASHBACK_BANNER_PADDING_PX.y,
        }}
        aria-label={headline}
      >
        <p
          className="m-0 min-w-0 bolt-font-body-s-regular text-primary"
          style={{ ...BODY_S_LINE, fontFeatureSettings: FONT_FEAT }}
        >
          <span
            className="bolt-font-body-s-accent"
            style={{
              ...SEMIBOLD,
              ...BODY_S_LINE,
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {accent}
          </span>
          {DINEOUT_CASHBACK_BANNER_HEADLINE_SUFFIX}
        </p>
        {secondaryText ?
          <Typography
            as="p"
            variant="body-s-regular"
            color="secondary"
            inlineStyle={{
              lineHeight: "var(--body-s-line-height, 20px)",
              fontFeatureSettings: FONT_FEAT,
            }}
          >
            {secondaryText}
          </Typography>
        : null}
        {onDismiss ?
          <button
            type="button"
            className="absolute right-1 top-1 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-[32px] border-none bg-neutral-secondary p-1 outline-none transition-opacity hover:opacity-90 active:opacity-80 focus-visible:ring-2 focus-visible:ring-action-primary"
            aria-label="Dismiss cashback banner"
            onClick={onDismiss}
          >
            <Cross size="xs" className="text-primary" aria-hidden />
          </button>
        : null}
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[84px] overflow-hidden"
          style={{ width: DINEOUT_CASHBACK_COIN_SLOT_PX }}
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
      </div>
    </div>
  )
}
