import { Typography } from "@bolteu/kalep-react"
import { useSnackbar } from "@/shared/snackbar"
import { ClaimOfferFooterActions } from "@/features/offers/components/ClaimOfferModal/ClaimOfferFooterActions"
import { ClaimPromoSheetShell } from "@/features/offers/components/claimFlow/ClaimPromoSheetShell"
import type { ClaimOfferModalOffer } from "@/features/offers/offers.types"
import {
  formatOfferDetailRows,
  type OfferDetailRow,
} from "@/features/offers/utils/formatOfferDetailRows"
import {
  Z_CLAIM_MODAL_CONTENT,
  Z_CLAIM_MODAL_OVERLAY,
} from "@/features/restaurant/constants/screenLayers"
import { CLAIM_PROMO_HERO_SRC } from "@/features/offers/constants/claimFlowHero"
import { getOfferBannerWindowPhase } from "@/features/restaurant/utils/offerBannerWindowPhase"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

export interface OfferDetailsSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  offer: ClaimOfferModalOffer
  onContinue: () => void
  container?: HTMLElement | null
}

function offerDetailsPrimaryActionLabel(
  offer: ClaimOfferModalOffer,
  nowMs: number,
): "Claim offer" | "Continue" {
  return getOfferBannerWindowPhase(offer, nowMs) === "active" ?
      "Claim offer"
    : "Continue"
}

/**
 * Pre-claim offer details (Figma `16081:15861`). Primary action opens the claim form.
 */
export function OfferDetailsSheet({
  isOpen,
  onOpenChange,
  offer,
  onContinue,
  container,
}: OfferDetailsSheetProps) {
  const snackbar = useSnackbar()
  const rows = formatOfferDetailRows(offer)
  const primaryActionLabel = offerDetailsPrimaryActionLabel(offer, Date.now())

  return (
    <ClaimPromoSheetShell
      open={isOpen}
      onOpenChange={onOpenChange}
      container={container}
      zOverlay={Z_CLAIM_MODAL_OVERLAY}
      zContent={Z_CLAIM_MODAL_CONTENT}
      title={`${offer.title} — ${offer.restaurantName}`}
      description={`Offer details for ${offer.title} at ${offer.restaurantName}.`}
      hero="offer-image"
      heroImageSrc={CLAIM_PROMO_HERO_SRC}
      footerClassName="bg-layer-floor-2 pt-4 pb-[max(2rem,var(--safe-area-bottom))]"
      footer={
        <ClaimOfferFooterActions
          onClick={onContinue}
          buttonLabel={primaryActionLabel}
        />
      }
    >
      <div className="flex flex-col gap-3 px-6 pb-3 pt-6">
        <Typography
          variant="heading-m-accent"
          color="primary"
          as="h2"
          inlineStyle={SEMIBOLD}
        >
          {offer.title}
        </Typography>
        <Typography variant="body-m-regular" color="primary" as="p">
          {offer.restaurantName}
        </Typography>
      </div>

      <OfferDetailsRows rows={rows} />

      <OfferDetailsDisclaimer
        onTermsPress={() => {
          snackbar.add({
            description:
              "Terms and conditions will be available in a future release.",
            timeout: 4000,
          })
        }}
      />
    </ClaimPromoSheetShell>
  )
}

function OfferDetailsRows({ rows }: { rows: OfferDetailRow[] }) {
  return (
    <div className="flex flex-col px-6 py-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-start justify-between gap-3 py-1"
        >
          <Typography variant="body-s-regular" color="secondary" as="span">
            {row.label}
          </Typography>
          <span className="text-right">
            <Typography variant="body-s-regular" color="primary" as="span">
              {row.value}
            </Typography>
          </span>
        </div>
      ))}
    </div>
  )
}

function OfferDetailsDisclaimer({
  onTermsPress,
}: {
  onTermsPress: () => void
}) {
  return (
    <div className="flex flex-col gap-3 px-6 pb-6 pt-0">
      <div className="h-px w-full shrink-0 bg-separator" aria-hidden />
      <Typography variant="body-s-regular" color="secondary" as="p">
        Offers only apply during specified timeframes. Only one discount applies
        per bill, but discounts and cashback can be combined.
      </Typography>
      <Typography variant="body-s-regular" color="secondary" as="p">
        Venues may add a service charge and other{" "}
        <button
          type="button"
          className="inline border-none bg-transparent p-0 align-baseline text-action-primary underline underline-offset-2 transition-opacity hover:opacity-90 active:opacity-80"
          onClick={onTermsPress}
        >
          <Typography as="span" variant="body-s-regular" color="action-primary">
            Terms and Conditions
          </Typography>
        </button>{" "}
        may apply.
      </Typography>
    </div>
  )
}
