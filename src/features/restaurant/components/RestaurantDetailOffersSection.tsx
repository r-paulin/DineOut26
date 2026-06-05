import { useMemo } from "react"
import { Typography } from "@bolteu/kalep-react"
import CheckCircle from "@bolteu/kalep-react-icons/dist/CheckCircle"
import Decline from "@bolteu/kalep-react-icons/dist/Decline"
import { DineOutCashbackBannerSlot } from "@/features/offers/components/paymentMethod/DineOutCashbackBannerSlot"
import {
  OFFERS_SECTION_SUBTEXT,
  RESTAURANT_OFFERS_CASHBACK_BANNER_SECONDARY,
} from "@/features/offers/constants/dineOutStackablePromo"
import { useRestaurantOffersCashbackBanner } from "@/features/restaurant/hooks/useRestaurantOffersCashbackBanner"
import { useOfferDateTabs } from "@/features/restaurant/hooks/useOfferDateTabs"
import { useOfferPanelTransition } from "@/features/restaurant/hooks/useOfferPanelTransition"
import { useOfferTabPanelViewportHeight } from "@/features/restaurant/hooks/useOfferTabPanelViewportHeight"
import type { ClaimedOffer, PaidOfferRecord } from "@/features/offers/offers.types"
import { sortRestaurantOfferCardsByClaim } from "@/features/restaurant/utils/sortRestaurantOfferCards"
import type {
  RestaurantOfferCardModel,
  RestaurantOfferDateTab,
  UserClaim,
} from "@/features/restaurant/restaurantDetail.types"
import { RestaurantDetailOffersEmptyState } from "./RestaurantDetailOffersEmptyState"
import { OfferBanner } from "./OfferBanner"

/** Figma `_Tab` (`15739:52087`): 88×58px — pt 4 + day 20 + slot 24 + pb 10, indicator overlays bottom 2px. */
const TAB_CELL =
  "relative box-border flex h-[58px] min-h-[58px] min-w-[88px] w-[88px] max-w-[88px] shrink-0 flex-col items-stretch overflow-hidden border-none bg-transparent p-0 cursor-pointer [font-variation-settings:'wght'_var(--font-weight-regular)]"

const TAB_CONTENT =
  "box-border flex h-full w-full flex-col items-center gap-0 px-1 pt-1 pb-2.5"

/** Figma `Content / Offer` — fixed 24px row above content bottom padding. */
const TAB_BOTTOM_SLOT = "flex h-6 w-full shrink-0 items-center justify-center"

const SEMIBOLD = {
  fontVariationSettings: "'wght' var(--font-weight-semibold)",
} as const

function tabHasUserClaim(
  tabId: string,
  offersByTabId: Record<string, RestaurantOfferCardModel[]>,
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>,
): boolean {
  return (offersByTabId[tabId] ?? []).some(
    (card) => claimedOffersById[card.id] != null,
  )
}

export interface RestaurantDetailOffersSectionProps {
  venueSlug: string
  tabs: RestaurantOfferDateTab[]
  offersByTabId: Record<string, RestaurantOfferCardModel[]>
  userClaims: readonly UserClaim[]
  claimedOffersById: Readonly<Record<string, ClaimedOffer>>
  paidOffersById?: Readonly<Record<string, PaidOfferRecord>>
  onOfferAvailablePress?: (offerId: string) => void
  onOfferClaimedPress?: (offerId: string) => void
  onPaidOfferPress?: (offerId: string) => void
}

/**
 * Offers section with horizontally scrollable date tabs, per-tab underline
 * indicators (Figma `_Tab`), ARIA tabs keyboard navigation, and an empty
 * state for no-offer dates. Selection and keyboard handling live in
 * {@link useOfferDateTabs}.
 *
 * Tab content uses stacked absolutely-positioned panels translated on tab
 * change (iOS-style slide). The visible viewport height follows only the
 * **active** panel so empty dates do not inherit the height of taller sibling
 * panels (which would leave a large blank gap before the venue section).
 */
export function RestaurantDetailOffersSection({
  venueSlug,
  tabs,
  offersByTabId,
  userClaims,
  claimedOffersById,
  paidOffersById = {},
  onOfferAvailablePress,
  onOfferClaimedPress,
  onPaidOfferPress,
}: RestaurantDetailOffersSectionProps) {
  const {
    activeTabId,
    setActiveTabId,
    tablistRef,
    registerTabRef,
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

  const { visible: cashbackBannerVisible, dismiss: dismissCashbackBanner } =
    useRestaurantOffersCashbackBanner(venueSlug)

  return (
    <section className="flex w-full flex-col gap-4 pb-3 pt-6" aria-label="Offers">
      <div className="flex flex-col gap-1 px-6">
        <Typography variant="heading-m-accent" color="primary" as="h2">
          Offers
        </Typography>
        <Typography variant="body-s-regular" color="secondary" as="p">
          {OFFERS_SECTION_SUBTEXT}
        </Typography>
      </div>
      <DineOutCashbackBannerSlot
        visible={cashbackBannerVisible}
        className="px-6"
        secondaryText={RESTAURANT_OFFERS_CASHBACK_BANNER_SECONDARY}
        onDismiss={dismissCashbackBanner}
      />
      <div
        ref={tablistRef}
        className="w-full overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Offer dates"
      >
        <div className="flex h-[58px] min-h-[58px] w-max max-w-none flex-nowrap gap-0">
          {tabs.map((tab) => {
            const selected = tab.id === activeTabId
            const claimed = tabHasUserClaim(
              tab.id,
              offersByTabId,
              claimedOffersById,
            )
            const tabAriaLabel =
              tab.state === "no-offer" ? `${tab.dayLabel}, no offer`
              : claimed ? `${tab.dayLabel}, offer claimed`
              : `${tab.dayLabel}, ${tab.discountLabel ?? ""}`
            return (
              <button
                key={tab.id}
                ref={registerTabRef(tab.id)}
                type="button"
                role="tab"
                id={`restaurant-offer-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`restaurant-offer-tabpanel-${tab.id}`}
                aria-label={tabAriaLabel}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTabId(tab.id)}
                onKeyDown={onTabKeyDown}
                className={TAB_CELL}
              >
                <div className={TAB_CONTENT}>
                  <Typography
                    variant="body-s-regular"
                    color="secondary"
                    as="span"
                    align="center"
                  >
                    {tab.dayLabel}
                  </Typography>
                  {tab.state === "no-offer" ?
                    <div className={TAB_BOTTOM_SLOT}>
                      <Decline size="sm" className="text-tertiary shrink-0" />
                    </div>
                  : claimed ?
                    <div className={TAB_BOTTOM_SLOT}>
                      <CheckCircle
                        size="sm"
                        className="shrink-0 text-action-primary"
                        aria-hidden
                      />
                    </div>
                  : <div className={TAB_BOTTOM_SLOT}>
                      <Typography
                        variant={selected ? "body-m-accent" : "body-m-regular"}
                        color="primary"
                        as="span"
                        align="center"
                        inlineStyle={selected ? SEMIBOLD : undefined}
                      >
                        {tab.discountLabel}
                      </Typography>
                    </div>
                  }
                </div>
                <div
                  className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 ${selected ? "bg-action-primary" : "bg-neutral-secondary"}`}
                  aria-hidden
                />
              </button>
            )
          })}
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
            Date.now(),
            paidOffersById,
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
                        venueSlug={venueSlug}
                        offer={card}
                        userClaims={userClaims}
                        claimedOffersById={claimedOffersById}
                        paidOffersById={paidOffersById}
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
                        onPaidOfferPress={
                          onPaidOfferPress
                            ? () => onPaidOfferPress(card.id)
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
