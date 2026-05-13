import { Typography } from "@bolteu/kalep-react"
import { useId } from "react"

/**
 * Discount badge — Figma Consumer Dine-out `15931:11816` (Discount) +
 * `15931:11817` (Discount / SVG) + `15931:11818` (Discount / Value).
 */
const DISCOUNT_PATH_D =
  "M9.69878 3.53058C9.66748 5.82002 9.53092 9.03999 9.0188 10.4585C8.17951 12.7791 2 14.5381 2 21.5C2 30.6407 9.03018 29.8152 9.03018 32.9103C9.03018 34.9331 9.02165 36.9644 9.02165 38.9815C9.02165 41.217 10.3645 42 11.457 42H56.9071C58.0594 42 59.7351 41.5574 59.7351 39.7928V32.8564C59.7351 29.9202 66 27.0974 66 21.5C66 12.2032 58.7223 13.1848 58.7223 9.31518C58.7223 7.08248 58.5459 6.21153 58.5459 4.55757C58.5459 1.66385 56.5401 1 55.0578 1H12.4443C10.4243 1 9.71585 2.07805 9.69593 3.53058H9.69878Z"

const DISCOUNT_VALUE_STYLE = {
  fontSize: "var(--body-m-font-size, 1rem)",
  lineHeight: "var(--body-m-line-height, 1.5rem)",
  letterSpacing: "-0.176px",
  fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
} as const

const FIGMA_SHAPE_BLEED = {
  top: "-2.44%",
  right: "-21.88%",
  bottom: "-46.34%",
  left: "-3.13%",
} as const

export interface OfferBannerDiscountStickerProps {
  tagFill: string
  label: string
  labelColor: string
}

export function OfferBannerDiscountSticker({
  tagFill,
  label,
  labelColor,
}: OfferBannerDiscountStickerProps) {
  const filterId = `offerDiscount-${useId().replace(/:/g, "")}`

  return (
    <div className="flex h-12 w-full min-w-0 max-w-[132px] items-center justify-center">
      {/*
        Figma: both SVG and value sit in `-rotate-5` stacks; one wrapper keeps them aligned.
        Inner frame: 64×41 (w-16 h-[41px]).
      */}
      <div className="relative h-[41px] w-16 shrink-0 rotate-[-5deg] [transform-origin:center]">
        <div
          className="absolute max-w-none overflow-visible"
          style={FIGMA_SHAPE_BLEED}
        >
          <svg
            viewBox="0 0 80 61"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block size-full max-w-none overflow-visible"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <g filter={`url(#${filterId})`}>
              <path d={DISCOUNT_PATH_D} fill={tagFill} />
            </g>
            <defs>
              <filter
                id={filterId}
                x="0"
                y="0"
                width="80"
                height="61"
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
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_0_4"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="2" dy="3" />
                <feGaussianBlur stdDeviation="2" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.09 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect1_dropShadow_0_4"
                  result="effect2_dropShadow_0_4"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="4" dy="7" />
                <feGaussianBlur stdDeviation="2.5" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect2_dropShadow_0_4"
                  result="effect3_dropShadow_0_4"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="8" dy="13" />
                <feGaussianBlur stdDeviation="3" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.01 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect3_dropShadow_0_4"
                  result="effect4_dropShadow_0_4"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect4_dropShadow_0_4"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center text-center leading-[0]">
          <Typography
            variant="body-m-accent"
            as="p"
            align="center"
            noWrap
            inlineStyle={{
              ...DISCOUNT_VALUE_STYLE,
              color: labelColor,
            }}
          >
            {label}
          </Typography>
        </div>
      </div>
    </div>
  )
}
