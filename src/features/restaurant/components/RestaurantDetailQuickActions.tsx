import { Typography } from "@bolteu/kalep-react"
import Call from "@bolteu/kalep-react-icons/dist/Call"
import Directions from "@bolteu/kalep-react-icons/dist/Directions"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import Invoice from "@bolteu/kalep-react-icons/dist/Invoice"

export interface RestaurantDetailQuickActionsProps {
  onOpenMenu?: () => void
  onOpenDirections?: () => void
  onCall?: () => void
  onOpenDetails?: () => void
}

const ICON_BTN =
  "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-none bg-neutral-secondary p-0 outline-none focus-visible:ring-2 focus-visible:ring-action-primary"

/**
 * Figma `16039:29267` — Menu, Details, Directions, Call.
 */
export function RestaurantDetailQuickActions({
  onOpenMenu,
  onOpenDirections,
  onCall,
  onOpenDetails,
}: RestaurantDetailQuickActionsProps) {
  const actions = [
    {
      id: "menu",
      label: "Menu",
      icon: <Invoice size="sm" className="text-primary" aria-hidden />,
      onClick: onOpenMenu,
      ariaLabel: "Menu",
    },
    {
      id: "details",
      label: "Details",
      icon: <Food size="sm" className="text-primary" aria-hidden />,
      onClick: onOpenDetails,
      ariaLabel: "Details",
    },
    {
      id: "directions",
      label: "Directions",
      icon: <Directions size="sm" className="text-primary" aria-hidden />,
      onClick: onOpenDirections,
      ariaLabel: "Directions",
    },
    {
      id: "call",
      label: "Call",
      icon: <Call size="sm" className="text-primary" aria-hidden />,
      onClick: onCall,
      ariaLabel: "Call",
    },
  ] as const

  return (
    <div
      className="flex w-full items-start justify-between px-6 pb-3 pt-2"
      role="group"
      aria-label="Quick actions"
    >
      {actions.map((action) => (
        <div
          key={action.id}
          className="flex min-w-[56px] shrink-0 flex-col items-center gap-2"
        >
          <button
            type="button"
            className={ICON_BTN}
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            disabled={!action.onClick}
          >
            {action.icon}
          </button>
          <Typography variant="body-xs-regular" color="primary" align="center" as="span">
            {action.label}
          </Typography>
        </div>
      ))}
    </div>
  )
}
