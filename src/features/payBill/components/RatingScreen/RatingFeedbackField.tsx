import type { ChangeEventHandler, RefObject } from "react"

const CLIP_START_HEIGHT_PX = 56

export interface RatingFeedbackFieldProps {
  value: string
  onChange: ChangeEventHandler<HTMLTextAreaElement>
  /** Outer clip box for GSAP height animation (Figma single-line → multiline). */
  heightClipRef: RefObject<HTMLDivElement | null>
}

/**
 * Figma `15825:12393` input: full-width rounded surface (`bg-neutral-secondary`), no double chrome.
 */
export function RatingFeedbackField({
  value,
  onChange,
  heightClipRef,
}: RatingFeedbackFieldProps) {
  return (
    <div
      ref={heightClipRef}
      className="w-full overflow-hidden rounded-xl bg-neutral-secondary"
      style={{ height: CLIP_START_HEIGHT_PX }}
    >
      <textarea
        value={value}
        onChange={onChange}
        maxLength={1000}
        rows={1}
        spellCheck={false}
        aria-label="Leave a feedback"
        placeholder="Leave a feedback"
        className={[
          "m-0 max-h-[168px] min-h-[56px] w-full resize-none border-none bg-transparent",
          "px-4 py-[15px] text-start text-body-m-regular text-primary outline-none",
          "placeholder:text-secondary",
          "font-[family-name:var(--font-family)] text-[length:var(--body-m-font-size,1rem)]",
          "leading-[var(--body-m-line-height,1.5rem)] tracking-[-0.011em]",
        ].join(" ")}
        style={{
          fontFeatureSettings: "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1",
          fontVariationSettings: "'wght' var(--font-weight-regular)",
        }}
      />
    </div>
  )
}
