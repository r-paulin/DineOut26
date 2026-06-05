import type { MouseEventHandler, ReactNode } from "react"
import { Typography } from "@bolteu/kalep-react"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"

export interface ListItemProps {
  /** Leading icon; omit for text-only rows (e.g. Getting there). */
  icon?: ReactNode
  /** Icon wrapper color; defaults to action green (venue feed uses primary). */
  iconTone?: "primary" | "action-primary"
  label: string
  value: string
  /** When false, hours-style static row (no chevron). */
  showChevron?: boolean
  /** Figma trailing action label (e.g. claimed-offer payment “Switch”); overrides chevron. */
  trailingActionLabel?: string
  /** When false, renders as non-interactive div. */
  interactive?: boolean
  onPress?: () => void
  /** Show 1px bottom separator inset with row horizontal padding (24px). */
  showSeparator?: boolean
  /** Row horizontal inset; `none` for parent-provided `px-6` sections. */
  horizontalPadding?: "default" | "none"
  labelColor?: "secondary" | "tertiary" | "danger-primary"
  /** `labelFirst`: small label on top (default). `valueFirst`: primary value on top like PIN rows. */
  lineOrder?: "labelFirst" | "valueFirst"
  href?: string
  external?: boolean
  /** Runs on anchor click before default navigation; call `preventDefault` to handle URLs yourself. */
  onAnchorClick?: MouseEventHandler<HTMLAnchorElement>
  className?: string
  "aria-label"?: string
}

const ROW_HIT_BASE =
  "flex w-full flex-col items-stretch border-none bg-transparent py-0 text-left text-inherit no-underline decoration-transparent visited:text-inherit"

/**
 * Two-line list row: icon, label (body-s secondary) + value (body-m primary),
 * optional chevron or trailing action label (Figma).
 */
export function ListItem({
  icon,
  label,
  value,
  showChevron = true,
  trailingActionLabel,
  interactive = true,
  onPress,
  showSeparator = true,
  horizontalPadding = "default",
  labelColor = "secondary",
  lineOrder = "labelFirst",
  iconTone = "action-primary",
  href,
  external,
  onAnchorClick,
  className,
  "aria-label": ariaLabel,
}: ListItemProps) {
  const iconWrapClass =
    iconTone === "primary" ? "text-primary" : "text-action-primary"
  const textLines =
    lineOrder === "valueFirst" ? (
      <>
        <Typography variant="body-m-regular" color="primary" as="span">
          {value}
        </Typography>
        {label.trim() ? (
          <Typography variant="body-s-regular" color={labelColor} as="span">
            {label}
          </Typography>
        ) : null}
      </>
    ) : (
      <>
        <Typography variant="body-s-regular" color={labelColor} as="span">
          {label}
        </Typography>
        <Typography variant="body-m-regular" color="primary" as="span">
          {value}
        </Typography>
      </>
    )

  const body = (
    <>
      <div className="flex w-full items-center gap-3 pt-[10px] pb-[9px]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {icon != null ? (
          <div className={`flex shrink-0 items-center ${iconWrapClass}`}>
            {icon}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
          {textLines}
        </div>
      </div>
      {trailingActionLabel ?
        <div className="flex shrink-0 items-center self-stretch">
          <Typography
            variant="body-m-accent"
            color="action-primary"
            as="span"
            noWrap
          >
            {trailingActionLabel}
          </Typography>
        </div>
      : showChevron ?
        <div className="flex min-w-6 shrink-0 self-stretch items-center justify-end">
          <ChevronRight size="sm" className="text-tertiary" aria-hidden />
        </div>
      : null}
      </div>
      {showSeparator ?
        <div className="h-px w-full shrink-0 bg-separator" aria-hidden />
      : null}
    </>
  )

  const isActionable = Boolean(href) || (interactive && Boolean(onPress))
  const rowHit = `${ROW_HIT_BASE} ${horizontalPadding === "none" ? "px-0" : "px-6"}`
  const mergedClass = [rowHit, isActionable ? "cursor-pointer" : "", className]
    .filter(Boolean)
    .join(" ")

  if (href) {
    return (
      <a
        href={href}
        className={mergedClass}
        aria-label={ariaLabel}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        onClick={(e) => {
          onAnchorClick?.(e)
          onPress?.()
        }}
      >
        {body}
      </a>
    )
  }

  if (interactive && onPress) {
    return (
      <button
        type="button"
        className={mergedClass}
        aria-label={ariaLabel}
        onClick={onPress}
      >
        {body}
      </button>
    )
  }

  return (
    <div className={mergedClass} aria-label={ariaLabel}>
      {body}
    </div>
  )
}
