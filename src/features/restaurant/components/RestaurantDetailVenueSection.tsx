import { forwardRef } from "react"
import { Button, Typography } from "@bolteu/kalep-react"
import Call from "@bolteu/kalep-react-icons/dist/Call"
import Food from "@bolteu/kalep-react-icons/dist/Food"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import { RESTAURANT_VENUE_ADDRESS_ROW_LABEL } from "@/features/restaurant/constants/restaurantAddressSheetCopy"
import { RESTAURANT_DETAIL_SECTION_TITLE_CLASS } from "@/features/restaurant/components/restaurantDetailSectionTitle"
import { RestaurantVenueGallery } from "@/features/restaurant/components/RestaurantVenueGallery"
import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"
import { ListItem } from "@/shared/components/ListItem"
import { toTelHref } from "@/shared/utils/telHref"

export interface RestaurantDetailVenueSectionProps
  extends Pick<
    RestaurantDetailModel,
    | "name"
    | "cuisineTags"
    | "venueGalleryCycles"
    | "venueHoursRowSubtitle"
    | "address"
    | "phone"
    | "isOpen"
  > {
  onOpenHours?: () => void
  onOpenAddress?: () => void
  onCall?: () => void
  /** Figma `16762:69736` — opens in-stack About page. */
  onOpenAbout?: () => void
  onOpenReportProblem?: () => void
}

const ROW_ICON_CLASS = "size-6 shrink-0"

const VENUE_HEADING_CLASS =
  "m-0 p-0 text-primary text-xl font-semibold leading-[1.5625rem] tracking-[-0.02125rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

/** Figma `16762:69736` — venue About list row. */
const VENUE_ABOUT_ROW_VALUE = "About venue" as const
const VENUE_ABOUT_ROW_LABEL = "Social media, amenities and more" as const

export const RestaurantDetailVenueSection = forwardRef<
  HTMLElement,
  RestaurantDetailVenueSectionProps
>(function RestaurantDetailVenueSection(
  {
  name,
  cuisineTags,
  venueGalleryCycles,
  venueHoursRowSubtitle,
  isOpen,
  address,
  phone,
  onOpenHours,
  onOpenAddress,
  onCall,
  onOpenAbout,
  onOpenReportProblem,
},
  ref,
) {
  const telHref = toTelHref(phone)
  const hoursStatusLabel = isOpen ? "Open now" : "Closed"

  return (
    <section
      ref={ref}
      id="restaurant-detail-venue"
      className="flex w-full flex-col"
      aria-labelledby="restaurant-detail-venue-heading"
    >
      <header className="px-6 pt-6">
        <h2 className={RESTAURANT_DETAIL_SECTION_TITLE_CLASS} id="restaurant-detail-venue-heading">
          Venue details
        </h2>
      </header>
      <RestaurantVenueGallery venueGalleryCycles={venueGalleryCycles} />
      <div className="flex flex-col gap-1 px-6 pb-3 pt-6">
        <h2 className={VENUE_HEADING_CLASS} style={{ fontFeatureSettings: '"cv03" 1, "cv04" 1' }}>
          {name}
        </h2>
        <Typography variant="body-m-regular" color="secondary" as="p">
          {cuisineTags}
        </Typography>
      </div>
      <ul className="m-0 flex list-none flex-col px-6 p-0 [&>li:not(:last-child)]:border-b [&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-separator">
        <li className="m-0 p-0">
          <ListItem
            icon={<Time size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            value={hoursStatusLabel}
            label={venueHoursRowSubtitle}
            interactive={Boolean(onOpenHours)}
            onPress={onOpenHours}
            horizontalPadding="none"
            showSeparator={false}
            aria-label={`Working hours, ${hoursStatusLabel}, ${venueHoursRowSubtitle}`}
          />
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={<Pin size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label={RESTAURANT_VENUE_ADDRESS_ROW_LABEL}
            value={address}
            interactive={Boolean(onOpenAddress)}
            onPress={onOpenAddress}
            aria-label={`${RESTAURANT_VENUE_ADDRESS_ROW_LABEL}: ${address}`}
            horizontalPadding="none"
            showSeparator={false}
          />
        </li>
        <li className="m-0 p-0">
          {telHref ? (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              iconTone="primary"
              lineOrder="valueFirst"
              label="Call venue"
              value={phone}
              href={telHref}
              onPress={onCall}
              aria-label={telHref ? `Call ${phone}` : undefined}
              horizontalPadding="none"
              showSeparator={false}
            />
          ) : (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              iconTone="primary"
              lineOrder="valueFirst"
              label="Call venue"
              value={phone}
              interactive={Boolean(onCall)}
              onPress={onCall}
              horizontalPadding="none"
              showSeparator={false}
            />
          )}
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={<Food size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            value={VENUE_ABOUT_ROW_VALUE}
            label={VENUE_ABOUT_ROW_LABEL}
            interactive={Boolean(onOpenAbout)}
            onPress={onOpenAbout}
            aria-label={`${VENUE_ABOUT_ROW_VALUE}, ${VENUE_ABOUT_ROW_LABEL}`}
            horizontalPadding="none"
            showSeparator={false}
          />
        </li>
      </ul>
      {onOpenReportProblem ?
        <div className="flex flex-col gap-3 px-6 pb-0 pt-6">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onOpenReportProblem}
          >
            Report a problem
          </Button>
        </div>
      : null}
    </section>
  )
})
