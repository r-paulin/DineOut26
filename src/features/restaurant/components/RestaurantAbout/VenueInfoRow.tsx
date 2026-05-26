import Call from "@bolteu/kalep-react-icons/dist/Call"
import Globe from "@bolteu/kalep-react-icons/dist/Globe"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import { ListItem } from "@/shared/components/ListItem"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { toTelHref } from "@/shared/utils/telHref"

const ROW_ICON_CLASS = "size-6 shrink-0"

export interface VenueInfoRowsProps {
  isOpenNow: boolean
  openingHours: string
  menuUrl: string
  menuRowValue: string
  address: string
  phone: string
  website: string
  openExternalUrl: (url: string) => void
  /** Opens the shared opening-hours bottom sheet (hours row). */
  onOpenHours?: () => void
  /** When set, menu row opens the in-app menu gallery instead of `menuUrl`. */
  onOpenMenuGallery?: () => void
}

function websiteHostname(website: string): string {
  try {
    const u = new URL(
      website.startsWith("http") ? website : `https://${website}`,
    )
    return u.hostname.replace(/^www\./, "")
  } catch {
    return website
  }
}

function websiteHref(website: string): string {
  return website.startsWith("http") ? website : `https://${website}`
}

/**
 * Venue info list: hours (opens hours sheet when `onOpenHours` is set), menu (in-app
 * gallery when `onOpenMenuGallery` is set, else external `menuUrl`), address, phone, website.
 */
export function VenueInfoRows({
  isOpenNow,
  openingHours,
  menuUrl,
  menuRowValue,
  address,
  phone,
  website,
  openExternalUrl,
  onOpenHours,
  onOpenMenuGallery,
}: VenueInfoRowsProps) {
  const telHref = toTelHref(phone)
  const mapsUrl = googleMapsSearchUrl(address)
  const siteHref = websiteHref(website)
  const hoursStatusLabel = isOpenNow ? "Open now" : "Closed"

  return (
    <ul className="m-0 flex list-none flex-col px-6 p-0 [&>li:not(:last-child)]:border-b [&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-separator">
      <li className="m-0 p-0">
        <ListItem
          icon={<Time size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          iconTone="primary"
          lineOrder="valueFirst"
          value={hoursStatusLabel}
          label={openingHours}
          showChevron
          interactive={Boolean(onOpenHours)}
          onPress={onOpenHours}
          horizontalPadding="none"
          showSeparator={false}
          aria-label={
            onOpenHours
              ? `Opening hours, ${hoursStatusLabel}, ${openingHours}`
              : undefined
          }
          labelColor={isOpenNow ? "secondary" : "tertiary"}
        />
      </li>
      <li className="m-0 p-0">
        {onOpenMenuGallery ? (
          <ListItem
            icon={<Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label="Check the menu and pricing"
            value={menuRowValue}
            interactive
            onPress={onOpenMenuGallery}
            horizontalPadding="none"
            showSeparator={false}
            aria-label={`Restaurant menu, ${menuRowValue}`}
          />
        ) : (
          <ListItem
            icon={<Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label="Check the menu and pricing"
            value={menuRowValue}
            href={menuUrl}
            horizontalPadding="none"
            showSeparator={false}
            onAnchorClick={(e) => {
              e.preventDefault()
              openExternalUrl(menuUrl)
            }}
            aria-label={`Restaurant menu, ${menuRowValue}`}
          />
        )}
      </li>
      <li className="m-0 p-0">
        <ListItem
          icon={<Pin size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          iconTone="primary"
          lineOrder="valueFirst"
          label="Address"
          value={address}
          href={mapsUrl}
          horizontalPadding="none"
          showSeparator={false}
          onAnchorClick={(e) => {
            e.preventDefault()
            openExternalUrl(mapsUrl)
          }}
          aria-label={`Open address in Google Maps: ${address}`}
        />
      </li>
      <li className="m-0 p-0">
        {telHref ? (
          <ListItem
            icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label="Phone"
            value={phone}
            href={telHref}
            horizontalPadding="none"
            showSeparator={false}
            aria-label={`Call ${phone}`}
          />
        ) : (
          <ListItem
            icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label="Phone"
            value={phone}
            interactive={false}
            horizontalPadding="none"
            showSeparator={false}
          />
        )}
      </li>
      <li className="m-0 p-0">
        <ListItem
          icon={<Globe size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          iconTone="primary"
          lineOrder="valueFirst"
          label="Website"
          value={websiteHostname(website)}
          href={siteHref}
          horizontalPadding="none"
          showSeparator={false}
          onAnchorClick={(e) => {
            e.preventDefault()
            openExternalUrl(siteHref)
          }}
          aria-label={`Open website ${websiteHostname(website)}`}
        />
      </li>
    </ul>
  )
}
