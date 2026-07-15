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

/** Figma `[Dine-out] Mini-banner-Img` — 56×56, bottom-right. */
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
    <MiniBannerShell greyscale={variant === "expired"}>
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

function MiniBannerShell({
  children,
  greyscale = false,
}: {
  children: ReactNode
  greyscale?: boolean
}) {
  return (
    <div
      className={`pointer-events-none absolute bottom-0 right-0 size-14 overflow-hidden${greyscale ? " grayscale" : ""}`}
      aria-hidden
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
