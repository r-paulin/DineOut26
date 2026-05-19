import Offer from "@bolteu/kalep-react-icons/dist/Offer"
import Percent from "@bolteu/kalep-react-icons/dist/Percent"
import Wallet from "@bolteu/kalep-react-icons/dist/Wallet"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import type { MapMarkerData } from "@/features/map/map.types"
import { MapPinTail } from "./MapPinTail"

export interface MapPinContentProps {
  marker: MapMarkerData
  /** Map pin selection — dark pill + mint icon (Figma 15809:12977). */
  selected?: boolean
}

/**
 * Pill / bubble + label rendered above the tail. Variant chooses the surface
 * (bubble for "food" markers, capsule pill for discount markers) and content
 * color (red / gray / dark / green).
 */
export function MapPinContent({ marker, selected }: MapPinContentProps) {
  const { variant, label, sublabel, discountText, timedOfferActiveNow } = marker

  if (variant === "map_pin") {
    const pillClass = selected ? "bg-neutral-primary" : "bg-layer-floor-1"
    const iconClass =
      selected ?
        "shrink-0 text-action-primary-inverted"
      : timedOfferActiveNow === false ?
        "shrink-0 text-tertiary"
      : "shrink-0 text-action-primary"
    const discountClass = selected
      ? "text-sm leading-5 -tracking-[0.00525rem] [font-variation-settings:'wght'_var(--font-weight-semibold)] text-static-key-light"
      : "text-sm leading-5 -tracking-[0.00525rem] [font-variation-settings:'wght'_var(--font-weight-semibold)] text-primary"
    const showDiscountPill = Boolean(discountText)

    return (
      <div
        className="ffeature inline-flex min-w-[4.75rem] w-max max-w-[min(22rem,calc(100vw-2rem))] flex-col items-center py-2.5"
        title={discountText}
      >
        {showDiscountPill ? (
          <div className="mb-0.5 flex flex-col items-center [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
            <div
              className={`relative z-[2] -mb-0.5 flex items-center gap-[0.3125rem] rounded-full px-2 py-1 ${pillClass}`}
            >
              <Offer size="xs" className={iconClass} />
              <span className={discountClass}>{discountText}</span>
            </div>
            <MapPinTail selected={selected} />
          </div>
        ) : null}
        <div
          className={`flex w-full justify-center px-0.5 ${showDiscountPill ? "mt-0.5" : ""}`}
        >
          <span
            className="inline-block w-full text-balance break-words text-center font-[family-name:var(--font-family)] text-xs leading-4 text-primary [font-feature-settings:'cv03'_1,'cv04'_1,'lnum'_1,'pnum'_1] [font-variation-settings:'wght'_650] [text-shadow:-1px_-1px_0_white,1px_-1px_0_white,-1px_1px_0_white,1px_1px_0_white]"
            title={label}
          >
            {label}
          </span>
        </div>
      </div>
    )
  }

  if (variant === "food") {
    const borderedFood = marker.id === "m2" || marker.id === "m3"
    const bubbleSurface = borderedFood
      ? "border-2 border-[var(--color-layer-floor-2)] bg-[linear-gradient(90deg,rgba(0,31,24,0.13),rgba(0,31,24,0.13)),#fff]"
      : "bg-layer-floor-1"
    return (
      <div className="ffeature flex flex-col items-center w-[5.5rem] py-2.5">
        <div className="flex flex-col items-center mb-0.5 [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center -mb-0.5 relative z-[2] ${bubbleSurface}`}
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
    variant === "discount_gray"
      ? "border-2 border-[var(--color-layer-floor-2)] bg-[linear-gradient(90deg,rgba(0,31,24,0.13),rgba(0,31,24,0.13)),#fff]"
      : "bg-layer-floor-1"

  const textColor =
    variant === "discount_red"
      ? "text-danger-primary"
      : variant === "discount_gray"
        ? "text-tertiary"
        : variant === "bolt_green"
          ? "text-action-primary"
          : "text-primary"

  const Icon = variant === "bolt_green" ? Wallet : Percent

  return (
    <div className="ffeature flex flex-col items-center w-[5.5rem] py-2.5">
      <div className="flex flex-col items-center mb-0.5 [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
        <div
          className={`flex items-center gap-[0.3125rem] px-2 py-1 rounded-full -mb-0.5 relative z-[2] ${pillSurface}`}
        >
          <Icon size="lg" className={textColor} />
          {discountText ? (
            <span
              className={`text-sm leading-5 -tracking-[0.00525rem] [font-variation-settings:'wght'_var(--font-weight-semibold)] ${textColor}`}
            >
              {discountText}
            </span>
          ) : null}
        </div>
        <MapPinTail />
      </div>
      <PinLabel label={label} sublabel={sublabel} />
    </div>
  )
}

function PinLabel({
  label,
  sublabel,
}: {
  label: string
  sublabel?: string
}) {
  return (
    <div className="mt-0.5 text-xs leading-4 [font-variation-settings:'wght'_var(--font-weight-semibold)] text-primary text-center max-w-[5.5rem] overflow-hidden text-ellipsis">
      {label}
      {sublabel ? (
        <>
          <br />
          <span style={{ fontWeight: 450 }}>{sublabel}</span>
        </>
      ) : null}
    </div>
  )
}
