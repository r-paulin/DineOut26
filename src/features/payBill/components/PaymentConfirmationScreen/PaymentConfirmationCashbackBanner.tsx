import { Typography } from "@bolteu/kalep-react"
import dineoutCashbackCoinUrl from "@/features/offers/assets/dineout-cashback-coin.png"
import { DINEOUT_CASHBACK_COIN_SLOT_PX } from "@/features/offers/constants/dineoutCashbackCoinLayout"
import {
  formatPayConfirmCashbackDescription,
  PAY_CONFIRM_CASHBACK_TITLE,
} from "@/features/payBill/constants/payBillCashbackCopy"

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

const COMPACT_BODY_M_LINE = {
  lineHeight: "var(--body-m-compact-line-height, 20px)",
} as const

/** Figma `_Cashback` coin frame — 56×56 clip with proportional zoom. */
const COIN_IMAGE_CLASS =
  "absolute max-w-none size-[194.47%] left-[-62.79%] top-[-47.22%]"

export interface PaymentConfirmationCashbackBannerProps {
  cashbackEur: number
}

/**
 * Figma `_Cashback` (`16413:122635`) — post-payment cashback confirmation in the paid sheet.
 */
export function PaymentConfirmationCashbackBanner({
  cashbackEur,
}: PaymentConfirmationCashbackBannerProps) {
  const description = formatPayConfirmCashbackDescription(cashbackEur)

  return (
    <div className="relative min-h-[56px] min-w-[15rem] w-full overflow-hidden rounded-xl bg-action-secondary py-2 pl-16 pr-3">
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
      <div className="flex min-w-0 flex-col gap-[2px]">
        <Typography
          as="p"
          variant="body-m-accent"
          color="primary"
          inlineStyle={{
            ...SEMIBOLD,
            ...COMPACT_BODY_M_LINE,
            fontFeatureSettings: FONT_FEAT,
          }}
        >
          {PAY_CONFIRM_CASHBACK_TITLE}
        </Typography>
        <Typography
          as="p"
          variant="body-m-regular"
          color="primary"
          inlineStyle={{
            ...COMPACT_BODY_M_LINE,
            fontFeatureSettings: FONT_FEAT,
          }}
        >
          {description}
        </Typography>
      </div>
    </div>
  )
}
