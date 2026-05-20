import {
  DINEOUT_PROMO_IMG_BOLT,
  DINEOUT_PROMO_IMG_GROUP,
} from "@/features/offers/components/dineOutPromoFigmaAssets"

export interface BoltDineOutLogoProps {
  /** Green bolt + white DineOut wordmark on dark hero (`16123:18340`). */
  variant?: "default" | "onDark"
}

const IMG_BASE_CLASS = "absolute inset-0 block size-full max-w-none object-contain"

/** Figma `_LC -- Bolt DineOut Logo` — 203×37 centered wordmark. */
export function BoltDineOutLogo({ variant = "default" }: BoltDineOutLogoProps) {
  const onDarkFilter = "[filter:brightness(0)_invert(1)]"
  const wordmarkClass =
    variant === "onDark" ?
      `absolute inset-[5.41%_0.44%_24.32%_37%] ${onDarkFilter}`
    : "absolute inset-[5.41%_0.44%_24.32%_37%]"
  const boltClass =
    variant === "onDark" ?
      `absolute inset-[0_68.91%_2.7%_1.04%] ${onDarkFilter}`
    : "absolute inset-[0_68.91%_2.7%_1.04%]"

  return (
    <div className="relative h-[37px] w-[203px] shrink-0 overflow-hidden" aria-hidden>
      <div className={boltClass}>
        <img alt="" src={DINEOUT_PROMO_IMG_BOLT} className={IMG_BASE_CLASS} />
      </div>
      <div className={wordmarkClass}>
        <img alt="" src={DINEOUT_PROMO_IMG_GROUP} className={IMG_BASE_CLASS} />
      </div>
    </div>
  )
}
