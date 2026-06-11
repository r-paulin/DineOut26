import dineoutCashbackCoinUrl from "@/features/offers/assets/dineout-cashback-coin.png"
import {
  DINEOUT_CASHBACK_BANNER_PADDING_PX,
  DINEOUT_CASHBACK_COIN_SLOT_PX,
} from "@/features/offers/constants/dineoutCashbackCoinLayout"
import {
  formatPayCashbackUpsellAccent,
  formatPayCashbackUpsellHeadline,
  PAY_CASHBACK_UPSELL_PREFIX,
  PAY_CASHBACK_UPSELL_SUFFIX,
} from "@/features/payBill/constants/payBillCashbackCopy"

const FONT_FEAT = "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

/** Figma `_Cashback Banner (DineOut)` coin frame — right-aligned clip. */
const COIN_IMAGE_CLASS =
  "absolute h-full max-w-none left-[-20.9%] top-[28.73%] w-[150%]"

export interface PayBillCashbackUpsellProps {
  cashbackEur: number
}

/**
 * Figma `_Cashback Banner (DineOut)` (`16381:28166`) — earn-back upsell above slide-to-pay.
 */
export function PayBillCashbackUpsell({
  cashbackEur,
}: PayBillCashbackUpsellProps) {
  const accent = formatPayCashbackUpsellAccent(cashbackEur)
  const headline = formatPayCashbackUpsellHeadline(cashbackEur)

  return (
    <div className="w-full shrink-0 px-6 pb-3">
      <div
        className="relative min-h-[68px] min-w-[15rem] w-full shrink-0 overflow-hidden rounded-[12px] bg-action-secondary"
        aria-label={headline}
      >
        <div
          className="flex min-h-[68px] min-w-0 flex-col justify-center"
          style={{
            paddingLeft: DINEOUT_CASHBACK_BANNER_PADDING_PX.xStart,
            paddingRight: DINEOUT_CASHBACK_BANNER_PADDING_PX.xEnd,
            paddingTop: DINEOUT_CASHBACK_BANNER_PADDING_PX.y,
            paddingBottom: DINEOUT_CASHBACK_BANNER_PADDING_PX.y,
          }}
        >
          <p
            className="m-0 min-w-0 bolt-font-body-s-regular text-primary"
            style={{ fontFeatureSettings: FONT_FEAT }}
          >
            {PAY_CASHBACK_UPSELL_PREFIX}
            <span
              className="bolt-font-body-s-accent"
              style={{
                ...SEMIBOLD,
                fontFeatureSettings: FONT_FEAT,
              }}
            >
              {accent}
            </span>
            {PAY_CASHBACK_UPSELL_SUFFIX}
          </p>
        </div>
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
