import { Typography } from "@bolteu/kalep-react"
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
    | "openHoursSummary"
    | "menuRowValue"
    | "address"
    | "phone"
  > {
  onOpenHours?: () => void
  onOpenMenu?: () => void
  onOpenMaps?: () => void
  onCall?: () => void
  onMoreAboutVenue?: () => void
}

const ROW_ICON_CLASS = "size-6 shrink-0 text-[var(--map-pin-selected)]"

export function RestaurantDetailVenueSection({
  name,
  cuisineTags,
  venueGalleryCycles,
  openHoursSummary,
  menuRowValue,
  address,
  phone,
  onOpenHours,
  onOpenMenu,
  onOpenMaps,
  onCall,
  onMoreAboutVenue,
}: RestaurantDetailVenueSectionProps) {
  const telHref = toTelHref(phone)
  const mapsHref = googleMapsSearchUrl(address)

  return (
    <section
      className="flex w-full flex-col bg-layer-floor-1"
      aria-labelledby="restaurant-detail-venue-heading"
    >
      <div className="relative z-[1] -mt-px w-full min-w-0 overflow-hidden rounded-t-lg bg-layer-floor-1">
        <header className="px-6 pt-6">
          <h2 className="m-0 p-0" id="restaurant-detail-venue-heading">
            <Typography variant="heading-m-accent" color="primary" as="span">
              Venue
            </Typography>
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
        <h2
          className="m-0 max-w-full text-primary text-xl font-semibold leading-[1.5625rem] tracking-[-0.02125rem] [font-variation-settings:'wght'_var(--font-weight-semibold)]"
          style={{ fontFeatureSettings: '"cv03" 1, "cv04" 1' }}
        >
          {name}
        </h2>
        <Typography variant="body-m-regular" color="secondary" as="p">
          {cuisineTags}
        </Typography>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        <li className="m-0 p-0">
          <ListItem
            icon={<Time size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            label="Open hours"
            value={openHoursSummary}
            interactive={Boolean(onOpenHours)}
            onPress={onOpenHours}
            aria-label={
              onOpenHours
                ? `Opening hours, ${openHoursSummary}`
                : undefined
            }
          />
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={
              <Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />
            }
            label="Check the menu and pricing"
            value={menuRowValue}
            interactive={Boolean(onOpenMenu)}
            onPress={onOpenMenu}
            aria-label={`Restaurant menu, ${menuRowValue}`}
          />
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={<Pin size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            label="Address"
            value={address}
            href={mapsHref}
            external
            onPress={onOpenMaps}
            aria-label={`Open address in Google Maps: ${address}`}
          />
        </li>
        <li className="m-0 p-0">
          {telHref ? (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              label="Phone"
              value={phone}
              href={telHref}
              onPress={onCall}
              aria-label={telHref ? `Call ${phone}` : undefined}
              showSeparator={false}
            />
          ) : (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              label="Phone"
              value={phone}
              interactive={Boolean(onCall)}
              onPress={onCall}
              showSeparator={false}
            />
          )}
        </li>
      </ul>
      <div className="px-6 py-6">
        <button
          type="button"
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(0,45,30,0.07)] px-4"
          onClick={onMoreAboutVenue}
        >
          <Typography variant="body-m-accent" color="primary" as="span">
            More about venue
          </Typography>
        </button>
      </div>
    </section>
  )
}
