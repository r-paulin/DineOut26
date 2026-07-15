import PercentFlower from "@bolteu/kalep-react-icons/dist/PercentFlower"
import Percent from "@bolteu/kalep-react-icons/dist/Percent"
import Wallet from "@bolteu/kalep-react-icons/dist/Wallet"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import type { MapMarkerData } from "@/features/map/map.types"
import {
  getOfferCampaignDiscountTextClass,
  getOfferCampaignIconClass,
  getOfferCampaignPillClass,
  MAP_PIN_WASHED_PILL_CLASS,
  type OfferCampaignSurface,
} from "@/features/offers/utils/offerDisplayActive"
import { MapPinTail, type MapPinTailTone } from "./MapPinTail"

export interface MapPinContentProps {
  marker: MapMarkerData
  /** Selected map pin — dark pill (Figma `19206:45803`). */
  selected?: boolean
}

/**
 * Pill / bubble + label. Discovery `map_pin` follows Figma `19206:45778`
 * (Normal / Selected / Closed).
 */
export function MapPinContent({ marker, selected }: MapPinContentProps) {
  const { variant, label, sublabel, discountText, timedOfferActiveNow } = marker

  if (variant === "map_pin") {
    const closed = timedOfferActiveNow === false
    const surface: OfferCampaignSurface =
      selected ? "mapPinSelected"
      : closed ? "mapPinClosed"
      : "mapPin"
    const tailTone: MapPinTailTone =
      selected ? "selected"
      : closed ? "closed"
      : "normal"
    const pillClass = getOfferCampaignPillClass(surface)
    const iconClass = getOfferCampaignIconClass(surface, !closed)
    const discountClass = getOfferCampaignDiscountTextClass(surface)
    const showDiscountPill = Boolean(discountText)

    return (
      <div
        className="ffeature inline-flex min-w-[4.75rem] w-max max-w-[min(22rem,calc(100vw-2rem))] flex-col items-center py-2.5"
        title={discountText}
      >
        {showDiscountPill ?
          <div className="flex flex-col items-center [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
            <div
              className={`relative z-[2] flex items-center gap-[5px] rounded-full px-2 py-1 ${pillClass}`}
            >
              <PercentFlower size="xs" className={iconClass} aria-hidden />
              <span className={discountClass}>{discountText}</span>
            </div>
            <MapPinTail tone={tailTone} />
          </div>
        : null}
        <PinLabel label={label} sublabel={sublabel} halo />
      </div>
    )
  }

  if (variant === "food") {
    const borderedFood = marker.id === "m2" || marker.id === "m3"
    const bubbleSurface = borderedFood ? MAP_PIN_WASHED_PILL_CLASS : "bg-layer-floor-1"
    return (
      <div className="ffeature flex w-[5.5rem] flex-col items-center py-2.5">
        <div className="mb-0.5 flex flex-col items-center [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
          <div
            className={`relative z-[2] -mb-px flex size-11 items-center justify-center rounded-full ${bubbleSurface}`}
          >
            <Food size="lg" className="text-primary" />
          </div>
          <MapPinTail />
        </div>
        <PinLabel label={label} sublabel={sublabel} />
      </div>
    )
  }

  const pillSurface =
    variant === "discount_gray" ? MAP_PIN_WASHED_PILL_CLASS : "bg-layer-floor-1"

  const textColor =
    variant === "discount_red" ? "text-danger-primary"
    : variant === "discount_gray" ? "text-tertiary"
    : variant === "bolt_green" ? "text-action-primary"
    : "text-primary"

  const Icon = variant === "bolt_green" ? Wallet : Percent

  return (
    <div className="ffeature flex w-[5.5rem] flex-col items-center py-2.5">
      <div className="mb-0.5 flex flex-col items-center [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
        <div
          className={`relative z-[2] -mb-px flex items-center gap-[5px] rounded-full px-2 py-1 ${pillSurface}`}
        >
          <Icon size="lg" className={textColor} />
          {discountText ?
            <span
              className={`text-sm leading-5 -tracking-[0.00525rem] [font-variation-settings:'wght'_var(--font-weight-semibold)] ${textColor}`}
            >
              {discountText}
            </span>
          : null}
        </div>
        <MapPinTail />
      </div>
      <PinLabel label={label} sublabel={sublabel} />
    </div>
  )
}

const LABEL_HALO =
  "[text-shadow:-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white,1px_1px_0_white]"

function PinLabel({
  label,
  sublabel,
  halo = false,
}: {
  label: string
  sublabel?: string
  halo?: boolean
}) {
  return (
    <div
      className={`mt-0.5 max-w-[5.5rem] overflow-hidden text-ellipsis text-center text-xs leading-4 text-primary [font-feature-settings:'cv03'_1,'cv04'_1,'lnum'_1,'pnum'_1] [font-variation-settings:'wght'_var(--font-weight-semibold)] ${halo ? LABEL_HALO : ""}`}
      title={label}
    >
      {label}
      {sublabel ?
        <>
          <br aria-hidden />
          {sublabel}
        </>
      : null}
    </div>
  )
}
