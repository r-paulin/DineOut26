/**
 * Discount badge — organic ticket blob (design SVG 68×47) + tabular discount value.
 * Label uses Body L compact **bold** (Figma); plain `span` so weight is not capped by Typography variants.
 */
const BLOB_PATH_D =
  "M8.93199 3.03153L26.7613 1.78478C26.7613 1.78478 27.7894 1.42601 28.5605 2.67694C29.3317 3.92787 29.9504 5.6861 32.8451 5.42198C35.7399 5.15787 36.6311 2.79741 36.6311 2.79741C36.6311 2.79741 36.9231 1.02793 38.2086 0.959631C39.4941 0.891331 56.0796 -6.10064e-05 56.0796 -6.10064e-05C56.0796 -6.10064e-05 58.1339 0.180187 59.1569 1.77442C60.1799 3.36865 65.78 12.7711 65.78 12.7711C65.78 12.7711 67.5889 16.3556 67.8922 20.6932C68.1955 25.0307 67.8316 28.2828 64.686 33.2379C61.5403 38.1929 61.2065 41.8748 61.2065 41.8748C61.2065 41.8748 60.9413 43.4542 59.7124 43.5402L39.8114 44.9318C39.8114 44.9318 39.1186 44.7119 38.7515 43.3371C38.3843 41.9622 37.4502 40.8461 35.6366 41.0254C33.823 41.2046 31.7031 42.377 31.8229 44.0899C31.9427 45.8028 30.5319 45.5776 30.5319 45.5776L11.3821 46.7007C11.3821 46.7007 10.0755 46.4682 9.65954 45.0999C9.24359 43.7316 7.09742 39.199 5.17434 37.0199C3.25125 34.8408 0.654802 30.8271 0.0397355 25.114C-0.575331 19.4008 6.11326 5.9679 6.11326 5.9679C6.11326 5.9679 7.08716 3.16053 8.93199 3.03153Z"

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
  return (
    <div className="flex w-full min-w-0 items-center justify-center">
      <div className="relative h-[47px] w-[68px] shrink-0 [transform-origin:center]">
        <svg
          width={68}
          height={47}
          viewBox="0 0 68 47"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="pointer-events-none absolute inset-0 block"
          aria-hidden
        >
          <path d={BLOB_PATH_D} fill={tagFill} />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-1">
          <span
            className="max-w-full whitespace-nowrap text-center font-bold tabular-nums [font-family:var(--font-family)] [font-size:var(--body-l-font-size,18px)] [line-height:var(--body-l-compact-line-height,22px)] [letter-spacing:-0.522px]"
            style={{
              color: labelColor,
              fontVariantNumeric: "lining-nums tabular-nums",
              fontFeatureSettings: "'cv03' 1, 'cv04' 1",
              fontVariationSettings: "'wght' var(--font-weight-bold)",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}
