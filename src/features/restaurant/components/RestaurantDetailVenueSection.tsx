import { Button, Typography } from "@bolteu/kalep-react"
import Call from "@bolteu/kalep-react-icons/dist/Call"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import type { RestaurantDetailModel } from "@/features/restaurant/restaurantDetail.types"
import { ListItem } from "@/shared/components/ListItem"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
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
  onOpenMenu?: () => void
  onOpenMaps?: () => void
  onCall?: () => void
  onMoreAboutVenue?: () => void
  onOpenReportProblem?: () => void
}

const ROW_ICON_CLASS = "size-6 shrink-0"

const VENUE_HEADING_CLASS =
  "m-0 p-0 text-primary text-xl font-semibold leading-[1.5625rem] tracking-[-0.02125rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

/** Figma `16123:18077` — section title. */
const VENUE_SECTION_TITLE_CLASS =
  "m-0 p-0 text-primary text-[1.75rem] font-semibold leading-[2.25rem] tracking-[-0.616px] [font-feature-settings:'cv03'_on,'cv04'_on] [font-variation-settings:'wght'_var(--font-weight-semibold)]"

export function RestaurantDetailVenueSection({
  name,
  cuisineTags,
  venueGalleryCycles,
  venueHoursRowSubtitle,
  isOpen,
  address,
  phone,
  onOpenHours,
  onOpenMenu,
  onOpenMaps,
  onCall,
  onMoreAboutVenue,
  onOpenReportProblem,
}: RestaurantDetailVenueSectionProps) {
  const telHref = toTelHref(phone)
  const mapsHref = googleMapsSearchUrl(address)
  const hoursStatusLabel = isOpen ? "Open now" : "Closed"

  return (
    <section
      className="flex w-full flex-col bg-layer-floor-1"
      aria-labelledby="restaurant-detail-venue-heading"
    >
      <div className="relative z-[1] -mt-px w-full min-w-0 overflow-hidden rounded-t-lg bg-layer-floor-1">
        <header className="px-6 pt-6">
          <h2 className={VENUE_SECTION_TITLE_CLASS} id="restaurant-detail-venue-heading">
            Venue
          </h2>
        </header>
        <div className="w-full min-w-0 overflow-x-auto px-6 pb-4 pt-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex w-max flex-row gap-3">
            {venueGalleryCycles.map((cycle, i) => (
              <div key={`${cycle.tall}-${i}`} className="flex shrink-0 gap-3">
                <div className="h-[250px] w-[272px] shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
                  <img
                    src={cycle.tall}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex h-[250px] w-[130px] shrink-0 flex-col gap-3">
                  <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
                    <img
                      src={cycle.top}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-[120px] w-full shrink-0 overflow-hidden rounded-[12px] bg-neutral-secondary">
                    <img
                      src={cycle.bottom}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
            icon={
              <Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />
            }
            iconTone="primary"
            lineOrder="valueFirst"
            label="Browse dishes and prices"
            value="Menu"
            interactive={Boolean(onOpenMenu)}
            onPress={onOpenMenu}
            aria-label="Menu, Browse dishes and prices"
            horizontalPadding="none"
            showSeparator={false}
          />
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={<Pin size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label="Address"
            value={address}
            href={mapsHref}
            external
            onPress={onOpenMaps}
            aria-label={`Open address in Google Maps: ${address}`}
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
              label="Phone number"
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
              label="Phone number"
              value={phone}
              interactive={Boolean(onCall)}
              onPress={onCall}
              horizontalPadding="none"
              showSeparator={false}
            />
          )}
        </li>
      </ul>
      {onMoreAboutVenue || onOpenReportProblem ?
        <div className="flex flex-col gap-3 px-6 py-6">
          {onMoreAboutVenue ?
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onMoreAboutVenue}
            >
              More about venue
            </Button>
          : null}
          {onOpenReportProblem ?
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onOpenReportProblem}
            >
              Report a problem
            </Button>
          : null}
        </div>
      : null}
    </section>
  )
}
