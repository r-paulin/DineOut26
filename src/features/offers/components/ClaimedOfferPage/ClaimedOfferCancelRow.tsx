import { Typography } from "@bolteu/kalep-react"
import BinOutlined from "@bolteu/kalep-react-icons/dist/BinOutlined"

export interface ClaimedOfferCancelRowProps {
  onCancel: () => void
}

export function ClaimedOfferCancelRow({ onCancel }: ClaimedOfferCancelRowProps) {
  return (
    <button
      type="button"
      className="flex w-full cursor-pointer flex-row items-center gap-3 border-none bg-transparent px-6 pb-[15px] pt-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-action-primary"
      onClick={onCancel}
    >
      <BinOutlined size="md" className="shrink-0 text-danger-primary" aria-hidden />
      <Typography variant="body-m-regular" color="danger-primary" as="span">
        Cancel offer
      </Typography>
    </button>
  )
}
