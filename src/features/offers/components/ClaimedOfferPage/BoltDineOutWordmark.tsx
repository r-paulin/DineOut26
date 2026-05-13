import { claimedOfferImageUrl } from "@/shared/utils/publicImageUrls"

const BOLT_MARK_SRC = claimedOfferImageUrl("bolt-dineout-bolt.svg")
const DINEOUT_WORD_SRC = claimedOfferImageUrl("bolt-dineout-word.svg")

/**
 * Figma Consumer Dine-out `15753:12904` / `_LC -- Bolt DineOut Logo` (`15023:2912`):
 * 203×37 wordmark above the venue name on the claimed-offer screen.
 */
export function BoltDineOutWordmark() {
  return (
    <div
      className="relative mx-auto h-[37px] w-[203px] max-w-full shrink-0 overflow-hidden"
      role="img"
      aria-label="Bolt DineOut"
    >
      <div className="absolute inset-[0_68.91%_2.7%_1.04%]">
        <img
          alt=""
          src={BOLT_MARK_SRC}
          className="absolute inset-0 block size-full max-w-none object-contain object-left"
          decoding="async"
        />
      </div>
      <div className="absolute inset-[5.41%_0.44%_24.32%_37%]">
        <img
          alt=""
          src={DINEOUT_WORD_SRC}
          className="absolute inset-0 block size-full max-w-none object-contain object-left"
          decoding="async"
        />
      </div>
    </div>
  )
}
