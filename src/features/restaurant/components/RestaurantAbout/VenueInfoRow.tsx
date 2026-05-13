import Call from "@bolteu/kalep-react-icons/dist/Call"
import Globe from "@bolteu/kalep-react-icons/dist/Globe"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import { ListItem } from "@/shared/components/ListItem"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { toTelHref } from "@/shared/utils/telHref"

const ICON = "size-6 shrink-0"

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

  return (
    <div className="flex w-full flex-col bg-layer-floor-1">
      <ListItem
        icon={<Time size="lg" className={ICON} aria-hidden />}
        label={isOpenNow ? "Open now" : "Closed"}
        value={openingHours}
        showChevron
        interactive={Boolean(onOpenHours)}
        onPress={onOpenHours}
        aria-label={
          onOpenHours
            ? `Opening hours, ${isOpenNow ? "Open now" : "Closed"}, ${openingHours}`
            : undefined
        }
        labelColor={isOpenNow ? "secondary" : "tertiary"}
      />
      {onOpenMenuGallery ? (
        <ListItem
          icon={<Receipt size="lg" className={ICON} aria-hidden />}
          label="Check the menu and pricing"
          value={menuRowValue}
          interactive
          onPress={onOpenMenuGallery}
          aria-label={`Restaurant menu, ${menuRowValue}`}
        />
      ) : (
        <ListItem
          icon={<Receipt size="lg" className={ICON} aria-hidden />}
          label="Check the menu and pricing"
          value={menuRowValue}
          href={menuUrl}
          onAnchorClick={(e) => {
            e.preventDefault()
            openExternalUrl(menuUrl)
          }}
        />
      )}
      <ListItem
        icon={<Pin size="lg" className={ICON} aria-hidden />}
        label="Address"
        value={address}
        href={mapsUrl}
        onAnchorClick={(e) => {
          e.preventDefault()
          openExternalUrl(mapsUrl)
        }}
      />
      {telHref ? (
        <ListItem
          icon={<Call size="lg" className={ICON} aria-hidden />}
          label="Phone"
          value={phone}
          href={telHref}
          aria-label={`Call ${phone}`}
        />
      ) : (
        <ListItem
          icon={<Call size="lg" className={ICON} aria-hidden />}
          label="Phone"
          value={phone}
          interactive={false}
        />
      )}
      <ListItem
        icon={<Globe size="lg" className={ICON} aria-hidden />}
        label="Website"
        value={websiteHostname(website)}
        href={siteHref}
        showSeparator={false}
        onAnchorClick={(e) => {
          e.preventDefault()
          openExternalUrl(siteHref)
        }}
      />
    </div>
  )
}
