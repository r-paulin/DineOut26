import { Typography } from "@bolteu/kalep-react"
import ChevronDown from "@bolteu/kalep-react-icons/dist/ChevronDown"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"

export interface FilterChipProps {
  label: string
  surface: "floating" | "flat"
  active: boolean
  trailing: "chevron" | "clear" | "none"
  onClick: () => void
  /** When `date === "today"` and Open now is toggled */
  pressed?: boolean
  /** Locked / non-interactive (e.g. Offer = Pre-book when date ≠ Today). */
  disabled?: boolean
  /** Optional override for the accessible name */
  "aria-label"?: string
}

/**
 * Custom filter pill matching Figma (neutral floating vs flat + active action-primary).
 * Single `<button>` per chip for accessibility (no nested controls).
 */
export function FilterChip({
  label,
  surface,
  active,
  trailing,
  onClick,
  pressed,
  disabled,
  "aria-label": ariaLabel,
}: FilterChipProps) {
  const inactiveSurface =
    surface === "floating"
      ? "bg-layer-floor-1 text-primary"
      : "bg-neutral-secondary text-primary"

  const activeSurface = "bg-action-primary"

  /** Forced selection that cannot be changed (e.g. Offer = Pre-book when date ≠ Today). */
  const lockedActiveSurface = "bg-layer-floor-1 border border-separator"

  const paddingClass =
    trailing === "none" ? "px-3 py-2" : "pl-3 pr-2 py-2"

  const lockedSelected = Boolean(disabled && active)

  /** Label uses primary-inverted on green; grey on locked white pill. */
  const iconClass = lockedSelected
    ? "text-secondary shrink-0"
    : active
      ? "text-static-key-light shrink-0"
      : "text-primary shrink-0"

  const cursorClass = disabled ? "cursor-default" : "cursor-pointer"

  const defaultAria =
    trailing === "clear" && active
      ? `${label}, remove filter`
      : ariaLabel ?? label

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={[
        "inline-flex flex-row items-center gap-0.5 rounded-lg border-none",
        cursorClass,
        "min-h-9 max-w-full min-w-0",
        paddingClass,
        lockedSelected
          ? lockedActiveSurface
          : active
            ? activeSurface
            : inactiveSurface,
      ].join(" ")}
      onClick={onClick}
      aria-pressed={pressed !== undefined ? pressed : undefined}
      aria-label={defaultAria}
    >
      <Typography
        as="span"
        variant="body-s-accent"
        color={
          lockedSelected ? "secondary" : active ? "primary-inverted" : "primary"
        }
        noWrap
      >
        {label}
      </Typography>
      {trailing === "chevron" ? (
        <ChevronDown size="sm" className={iconClass} aria-hidden />
      ) : null}
      {trailing === "clear" ? (
        <Cross size="sm" className={iconClass} aria-hidden />
      ) : null}
    </button>
  )
}
