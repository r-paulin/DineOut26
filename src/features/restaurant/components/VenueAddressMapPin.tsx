import Food from "@bolteu/kalep-react-icons/dist/Food"
import gsap from "gsap"
import { useId, useLayoutEffect, useRef } from "react"
import { EASE_STANDARD_OUT, MOTION_IN_PAGE_S } from "@/shared/motion"
import { motionReduced } from "@/shared/motion/motionHelpers"

/** Figma export — pin tip y in the 69px-tall asset. */
const PIN_TIP_Y_PX = 52.1667
/** Pin-head center y in the 69px asset (food icon anchor). */
const PIN_HEAD_CENTER_Y_PX = 28

/**
 * Centered venue pin for the address sheet map snapshot.
 * Figma `16947:60234` — 64×69 union pin + food icon (`16947:60235`).
 */
export function VenueAddressMapPin() {
  const filterId = useId().replace(/:/g, "")
  const pinRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = pinRef.current
    if (!el) return

    gsap.killTweensOf(el)

    if (motionReduced()) {
      gsap.set(el, { opacity: 1 })
      return
    }

    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: MOTION_IN_PAGE_S,
        ease: EASE_STANDARD_OUT,
        delay: 0.08,
      },
    )
  }, [])

  return (
    <div
      ref={pinRef}
      className="pointer-events-none absolute left-1/2 top-1/2 h-[69px] w-16 opacity-0"
      style={{ transform: `translate(-50%, -${PIN_TIP_Y_PX}px)` }}
      aria-hidden
    >
      <svg
        width={64}
        height={69}
        viewBox="0 0 64 69"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block size-full overflow-visible"
        aria-hidden
      >
        <g filter={`url(#${filterId})`}>
          <path
            d="M31.6121 51.8814C31.6714 52.0716 31.8357 52.1667 32 52.1667C32.1643 52.1667 32.3286 52.0716 32.3879 51.8814C33.1965 49.2871 35.225 48.2698 37.5418 47.2223C45.75 44.25 52 37.123 52 28C52 16.9543 43.0457 8 32 8C20.9543 8 12 16.9543 12 28C12 37.123 18.25 44.25 26.4582 47.2223C28.775 48.2698 30.8035 49.2871 31.6121 51.8814Z"
            fill="#191F1C"
          />
        </g>
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="64"
            height="68.166"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_16947_60235"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_16947_60235"
              result="shape"
            />
          </filter>
        </defs>
      </svg>
      <Food
        size="lg"
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-static-key-light"
        style={{ top: `${PIN_HEAD_CENTER_Y_PX}px` }}
        aria-hidden
      />
    </div>
  )
}
