import type { ComponentType } from "react"
import { Typography } from "@bolteu/kalep-react"
import type { KalepIcon } from "@bolteu/kalep-react-icons/dist/types"
import Home from "@bolteu/kalep-react-icons/dist/Home"
import HomeOutlined from "@bolteu/kalep-react-icons/dist/HomeOutlined"
import Basket from "@bolteu/kalep-react-icons/dist/Basket"
import Search from "@bolteu/kalep-react-icons/dist/Search"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import FoodOutlined from "@bolteu/kalep-react-icons/dist/FoodOutlined"
import User from "@bolteu/kalep-react-icons/dist/User"
import UserOutlined from "@bolteu/kalep-react-icons/dist/UserOutlined"

export interface BottomNavProps {
  activeTab: string
  onTabChange: (id: string) => void
}

type IconComp = ComponentType<KalepIcon>

const TABS: ReadonlyArray<{
  id: string
  label: string
  Outlined: IconComp
  Filled: IconComp
}> = [
  { id: "home", label: "Home", Outlined: HomeOutlined, Filled: Home },
  { id: "stores", label: "Stores", Outlined: Basket, Filled: Basket },
  { id: "search", label: "Search", Outlined: Search, Filled: Search },
  { id: "dineout", label: "DineOut", Outlined: FoodOutlined, Filled: Food },
  { id: "account", label: "Account", Outlined: UserOutlined, Filled: User },
]

/** Persistent bottom navigation bar pinned to the bottom of the device frame. */
export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[var(--shell-width)] z-50 bg-layer-floor-2 border-t border-separator pt-2 pb-[env(safe-area-inset-bottom,0)]"
      aria-label="Main"
    >
      <div className="flex items-start justify-around">
        {TABS.map(({ id, label, Outlined, Filled }) => {
          const active = activeTab === id
          const Icon = active ? Filled : Outlined
          return (
            <button
              key={id}
              type="button"
              data-no-press
              className={`flex-1 flex flex-col items-center gap-0.5 px-1 pb-1 bg-transparent border-none cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-offset-2 focus-visible:ring-offset-layer-floor-2 ${
                active ? "text-primary" : "text-tertiary"
              }`}
              aria-current={active ? "page" : undefined}
              onClick={() => onTabChange(id)}
            >
              <Icon size="lg" className="shrink-0" />
              <Typography
                variant="body-xs-regular"
                align="center"
                inlineStyle={{ width: "100%" }}
              >
                {label}
              </Typography>
            </button>
          )
        })}
      </div>
      <div className="h-[2.125rem] flex items-end justify-center pb-2">
        <div
          className="w-[8.375rem] h-[0.3125rem] rounded-full bg-[var(--color-content-primary)] opacity-35"
          aria-hidden
        />
      </div>
    </nav>
  )
}
