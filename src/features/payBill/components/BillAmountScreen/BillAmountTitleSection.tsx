import { Typography } from "@bolteu/kalep-react"

const FONT_FEAT =
  "'cv03' 1, 'cv04' 1, 'lnum' 1, 'pnum' 1" as const

export interface BillAmountTitleSectionProps {
  subtitle: string
}

/** Figma `Bill Amount / Title` — gap 4px, pb 24px before input row. */
export function BillAmountTitleSection({ subtitle }: BillAmountTitleSectionProps) {
  return (
    <div className="flex w-full flex-col items-center gap-1 px-6 pb-6 text-center">
      <Typography
        variant="body-m-accent"
        color="primary"
        as="p"
        align="center"
        inlineStyle={{
          fontFeatureSettings: FONT_FEAT,
        }}
      >
        Total to pay
      </Typography>
      <Typography
        variant="body-s-regular"
        color="secondary"
        as="p"
        align="center"
        inlineStyle={{
          fontFeatureSettings: FONT_FEAT,
        }}
      >
        {subtitle}
      </Typography>
    </div>
  )
}
