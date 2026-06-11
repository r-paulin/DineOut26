import { Typography } from "@bolteu/kalep-react"
import BinOutlined from "@bolteu/kalep-react-icons/dist/BinOutlined"

export interface ClaimedOfferCancelRowProps {
  checkedIn: boolean
  onCancel: () => void
}

export function ClaimedOfferCancelRow({
  checkedIn,
  onCancel,
}: ClaimedOfferCancelRowProps) {
  const muted = checkedIn
  const iconClass =
    muted ? "shrink-0 text-secondary" : "shrink-0 text-danger-primary"

  return (
    <button
      type="button"
      disabled={checkedIn}
      aria-label={
        checkedIn ? "Cancel offer unavailable after check-in" : "Cancel offer"
      }
      className={[
        "flex w-full flex-row items-center gap-3 border-none bg-transparent px-6 pb-[15px] pt-4 text-left outline-none disabled:opacity-100",
        checkedIn ?
          "cursor-default"
        : "cursor-pointer focus-visible:ring-2 focus-visible:ring-action-primary",
      ].join(" ")}
      onClick={onCancel}
    >
      <BinOutlined size="md" className={iconClass} aria-hidden />
      <Typography
        variant="body-m-regular"
        color={muted ? "secondary" : "danger-primary"}
        as="span"
      >
        Cancel offer
      </Typography>
    </button>
  )
}
