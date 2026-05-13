import { Typography } from "@bolteu/kalep-react"
import type { TipOption } from "@/features/payBill/payBill.types"

export interface TipPillProps {
  option: TipOption
  isSelected: boolean
  onSelect: () => void
  onDeselect: () => void
}

/**
 * Tip chip: two-line EUR + % (presets) or single "Other"; Figma selected = action primary fill.
 */
export function TipPill({
  option,
  isSelected,
  onSelect,
  onDeselect,
}: TipPillProps) {
  const twoLine = Boolean(option.secondaryLabel)
  return (
    <button
      type="button"
      onClick={() => {
        if (isSelected) onDeselect()
        else onSelect()
      }}
      className={`flex min-h-[60px] min-w-0 flex-1 flex-col items-center justify-center rounded-lg p-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-action-primary ${
        isSelected ?
          "bg-action-primary text-static-key-light"
        : "bg-neutral-secondary text-primary"
      }`}
    >
      {twoLine ?
        <>
          <Typography
            variant="body-s-accent"
            color={isSelected ? "primary-inverted" : "primary"}
            as="span"
            align="center"
            noWrap
            inlineStyle={{
              fontVariationSettings: "'wght' var(--font-weight-semibold)",
            }}
          >
            {option.label}
          </Typography>
          <Typography
            variant="body-xs-regular"
            color={isSelected ? "primary-inverted" : "secondary"}
            as="span"
            align="center"
            noWrap
            paddingTop={1}
          >
            {option.secondaryLabel}
          </Typography>
        </>
      : (
        <Typography
          variant="body-s-accent"
          color={isSelected ? "primary-inverted" : "primary"}
          as="span"
          align="center"
          noWrap
          inlineStyle={{
            fontVariationSettings: "'wght' var(--font-weight-semibold)",
          }}
        >
          {option.label}
        </Typography>
      )}
    </button>
  )
}
