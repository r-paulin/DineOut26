import type { ReactNode } from "react"
import {
  OFFER_BANNER_MINI_CLAIMED_SRC,
  OFFER_BANNER_MINI_UNCLAIMED_BASE_SRC,
  OFFER_BANNER_MINI_UNCLAIMED_OVERLAY_SRC,
} from "@/features/restaurant/components/OfferBanner/offerBannerAssets"
import type { OfferBannerImageVariant } from "@/features/restaurant/components/OfferBanner/useOfferBannerContent"

export interface OfferBannerMiniBannerImgProps {
  variant: OfferBannerImageVariant
}

export function OfferBannerMiniBannerImg({
  variant,
}: OfferBannerMiniBannerImgProps) {
  if (variant === "claimed") {
    return (
      <MiniBannerShell>
        <img
          src={OFFER_BANNER_MINI_CLAIMED_SRC}
          alt=""
          className="absolute left-[-2.25%] top-[1.79%] size-[118.17%] max-w-none object-contain"
        />
      </MiniBannerShell>
    )
  }

  return (
    <MiniBannerShell>
      <img
        src={OFFER_BANNER_MINI_UNCLAIMED_BASE_SRC}
        alt=""
        className="absolute left-[-2.25%] top-[1.79%] size-[118.17%] max-w-none object-contain"
        aria-hidden
      />
      <img
        src={OFFER_BANNER_MINI_UNCLAIMED_OVERLAY_SRC}
        alt=""
        className="absolute left-[-10.7%] top-[-6.78%] size-[140.03%] max-w-none object-contain"
        aria-hidden
      />
    </MiniBannerShell>
  )
}

function MiniBannerShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute bottom-[-1px] right-[-1px] size-14 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
