import {
  DINEOUT_PROMO_IMG_BOLT,
  DINEOUT_PROMO_IMG_GROUP,
} from "@/features/offers/components/dineOutPromoFigmaAssets"

/** Figma `_LC -- Bolt DineOut Logo` — 203×37 centered wordmark. */
export function BoltDineOutLogo() {
  return (
    <div
      className="relative h-[37px] w-[203px] shrink-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-[0_68.91%_2.7%_1.04%]">
        <img
          alt=""
          src={DINEOUT_PROMO_IMG_BOLT}
          className="absolute inset-0 block size-full max-w-none object-contain"
        />
      </div>
      <div className="absolute inset-[5.41%_0.44%_24.32%_37%]">
        <img
          alt=""
          src={DINEOUT_PROMO_IMG_GROUP}
          className="absolute inset-0 block size-full max-w-none object-contain"
        />
      </div>
    </div>
  )
}
