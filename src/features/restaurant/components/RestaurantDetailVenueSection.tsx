import { Button, Typography } from "@bolteu/kalep-react"
import Call from "@bolteu/kalep-react-icons/dist/Call"
import ChevronRight from "@bolteu/kalep-react-icons/dist/ChevronRight"
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

const ROW_ICON_CLASS = "size-6 shrink-0 text-[var(--map-pin-selected)]"

export function RestaurantDetailVenueSection({
  name,
  cuisineTags,
  venueGalleryCycles,
  openHoursSummary,
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
  const hoursRowInteractive = Boolean(onOpenHours)
  const hoursRowClass =
    "flex w-full items-center gap-3 border-0 bg-transparent px-6 pb-[9px] pt-[10px] text-left no-underline outline-none focus-visible:ring-2 focus-visible:ring-action-primary focus-visible:ring-inset"

  const hoursRowInner = (
    <>
      <div className="flex shrink-0 items-center text-action-primary">
        <Time size="lg" className="size-6 shrink-0" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <Typography variant="body-m-regular" color="primary" as="span" noWrap>
          {openHoursSummary}
        </Typography>
        <Typography variant="body-s-regular" color="secondary" as="span">
          Working hours
        </Typography>
      </div>
      <div className="flex shrink-0 items-center gap-1 ps-2 text-action-primary">
        <Typography variant="body-m-accent" color="primary" as="span" noWrap>
          {hoursStatusLabel}
        </Typography>
        <ChevronRight size="lg" className="shrink-0 text-tertiary" aria-hidden />
      </div>
    </>
  )

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
      <ul className="m-0 flex list-none flex-col p-0 [&>li:not(:last-child)]:border-b [&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-separator">
        <li className="m-0 p-0">
          {hoursRowInteractive ?
            <button
              type="button"
              className={`${hoursRowClass} cursor-pointer`}
              onClick={onOpenHours}
              aria-label={`Working hours, ${openHoursSummary}, ${hoursStatusLabel}`}
            >
              {hoursRowInner}
            </button>
          : <div
              className={hoursRowClass}
              aria-label={`Working hours, ${openHoursSummary}, ${hoursStatusLabel}`}
            >
              {hoursRowInner}
            </div>}
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={
              <Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />
            }
            lineOrder="valueFirst"
            label="Browse dishes and prices"
            value="Menu"
            interactive={Boolean(onOpenMenu)}
            onPress={onOpenMenu}
            aria-label={`Menu, Browse dishes and prices`}
            showSeparator={false}
          />
        </li>
        <li className="m-0 p-0">
          <ListItem
            icon={<Pin size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            lineOrder="valueFirst"
            label="Address"
            value={address}
            href={mapsHref}
            external
            onPress={onOpenMaps}
            aria-label={`Open address in Google Maps: ${address}`}
            showSeparator={false}
          />
        </li>
        <li className="m-0 p-0">
          {telHref ? (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              lineOrder="valueFirst"
              label="Phone number"
              value={phone}
              href={telHref}
              onPress={onCall}
              aria-label={telHref ? `Call ${phone}` : undefined}
              showSeparator={false}
            />
          ) : (
            <ListItem
              icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
              lineOrder="valueFirst"
              label="Phone number"
              value={phone}
              interactive={Boolean(onCall)}
              onPress={onCall}
              showSeparator={false}
            />
          )}
        </li>
      </ul>
      <div className="flex flex-col gap-4 px-6 py-6">
        <button
          type="button"
          className="flex h-14 w-full cursor-pointer items-center justify-center rounded-full border-none bg-[rgba(0,45,30,0.07)] px-4"
          onClick={onMoreAboutVenue}
        >
          <Typography variant="body-m-accent" color="primary" as="span">
            More about venue
          </Typography>
        </button>
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
    </section>
  )
}
