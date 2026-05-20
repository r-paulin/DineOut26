import { useMemo } from "react"
import { Typography } from "@bolteu/kalep-react"
import Decline from "@bolteu/kalep-react-icons/dist/Decline"
import { useOfferDateTabs } from "@/features/restaurant/hooks/useOfferDateTabs"
import { useOfferPanelTransition } from "@/features/restaurant/hooks/useOfferPanelTransition"
import { useOfferTabPanelViewportHeight } from "@/features/restaurant/hooks/useOfferTabPanelViewportHeight"
import type { ClaimedOffer } from "@/features/offers/offers.types"
import { sortRestaurantOfferCardsByClaim } from "@/features/restaurant/utils/sortRestaurantOfferCards"
import type {
  RestaurantOfferCardModel,
  RestaurantOfferDateTab,
  UserClaim,
} from "@/features/restaurant/restaurantDetail.types"
import { RestaurantDetailOffersEmptyState } from "./RestaurantDetailOffersEmptyState"
import { OfferBanner } from "./OfferBanner"

/** Figma `_Tab`: fixed 88px column, 4px horizontal inset (`space/1`), 12px below labels to indicator. */
const TAB_CELL =
  "box-border flex min-h-0 min-w-[88px] w-[88px] max-w-[88px] shrink-0 flex-col items-center justify-center overflow-hidden border-none bg-transparent px-1 pb-3 pt-1 cursor-pointer"

export interface RestaurantDetailOffersSectionProps {
  tabs: RestaurantOfferDateTab[]
  offersByTabId: Record<string, RestaurantOfferCardModel[]>
  userClaims: readonly UserClaim[]
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
  onOfferAvailablePress?: (offerId: string) => void
  onOfferClaimedPress?: (offerId: string) => void
}

/**
 * Offers section with horizontally scrollable date tabs, an animated underline
 * indicator, ARIA tabs keyboard navigation, and an empty state for no-offer
 * dates. State, indicator measurement, and keyboard handling live in
 * {@link useOfferDateTabs}.
 *
 * Tab content uses stacked absolutely-positioned panels translated on tab
 * change (iOS-style slide). The visible viewport height follows only the
 * **active** panel so empty dates do not inherit the height of taller sibling
 * panels (which would leave a large blank gap before the venue section).
 */
export function RestaurantDetailOffersSection({
  tabs,
  offersByTabId,
  userClaims,
  claimedOffersById,
  onOfferAvailablePress,
  onOfferClaimedPress,
}: RestaurantDetailOffersSectionProps) {
  const {
    activeTabId,
    setActiveTabId,
    tablistRef,
    registerTabRef,
    indicatorStyle,
    onTabKeyDown,
  } = useOfferDateTabs(tabs)

  const { viewportHeight, registerPanelRef } =
    useOfferTabPanelViewportHeight(activeTabId)

  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs])
  const { registerCardRef } = useOfferPanelTransition(activeTabId, tabIds)

  const activeIdx = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTabId),
  )

  return (
    <section className="flex w-full flex-col gap-4 pb-3 pt-6" aria-label="Offers">
      <div className="px-6">
        <Typography variant="heading-s-accent" color="primary" as="h2">
          Offers
        </Typography>
      </div>
      <div
        ref={tablistRef}
        className="w-full overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Offer dates"
      >
        <div className="relative flex w-max max-w-none flex-nowrap gap-0">
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId
            const discountVariant = selected ? "body-m-accent" : "body-m-regular"
            const rowGap =
              tab.state === "no-offer" ? "gap-0" : "gap-0.5"
            return (
              <button
                key={tab.id}
                ref={registerTabRef(tab.id)}
                type="button"
                role="tab"
                id={`restaurant-offer-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`restaurant-offer-tabpanel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTabId(tab.id)}
                onKeyDown={onTabKeyDown}
                className={`${TAB_CELL} ${rowGap}`}
              >
                <Typography
                  variant="body-s-regular"
                  color="secondary"
                  as="span"
                  align="center"
                >
                  {tab.dayLabel}
                </Typography>
                {tab.state === "no-offer" ? (
                  <div className="flex h-6 w-full shrink-0 items-center justify-center">
                    <Decline size="sm" className="text-tertiary shrink-0" />
                  </div>
                ) : (
                  <Typography
                    variant={discountVariant}
                    color="primary"
                    as="span"
                    align="center"
                  >
                    {tab.discountLabel}
                  </Typography>
                )}
              </button>
            )
          })}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-neutral-secondary"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 h-[2px] bg-action-primary transition-[transform,width] duration-200 ease-out motion-reduce:transition-none"
            style={{
              transform: indicatorStyle.transform,
              width: `${indicatorStyle.width}px`,
            }}
            aria-hidden
          />
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden"
        style={
          viewportHeight != null ? { height: viewportHeight } : undefined
        }
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId
          const tabCards = sortRestaurantOfferCardsByClaim(
            offersByTabId[tab.id] ?? [],
            userClaims,
          )
          const offset = idx - activeIdx
          return (
            <div
              key={tab.id}
              ref={registerPanelRef(tab.id)}
              role="tabpanel"
              id={`restaurant-offer-tabpanel-${tab.id}`}
              aria-labelledby={`restaurant-offer-tab-${tab.id}`}
              aria-hidden={!isActive}
              inert={!isActive ? true : undefined}
              className={`absolute left-0 top-0 w-full px-6 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transition-none ${!isActive ? "pointer-events-none" : ""}`}
              style={{
                transform: `translateX(${offset * 100}%)`,
              }}
            >
              {tabCards.length === 0 ? (
                <RestaurantDetailOffersEmptyState />
              ) : (
                <div className="flex flex-col gap-3">
                  {tabCards.map((card, cardIdx) => (
                    <div
                      key={card.id}
                      ref={registerCardRef(tab.id, cardIdx)}
                      className="will-change-[opacity]"
                    >
                      <OfferBanner
                        context="restaurant"
                        offer={card}
                        userClaims={userClaims}
                        claimedOffersById={claimedOffersById}
                        onAvailablePress={
                          onOfferAvailablePress
                            ? () => onOfferAvailablePress(card.id)
                            : undefined
                        }
                        onClaimedPress={
                          onOfferClaimedPress
                            ? () => onOfferClaimedPress(card.id)
                            : undefined
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
