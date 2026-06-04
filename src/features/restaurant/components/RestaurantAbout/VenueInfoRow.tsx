import Calendar from "@bolteu/kalep-react-icons/dist/Calendar"
import Call from "@bolteu/kalep-react-icons/dist/Call"
import Globe from "@bolteu/kalep-react-icons/dist/Globe"
import LogoFacebook from "@bolteu/kalep-react-icons/dist/LogoFacebook"
import LogoInstagram from "@bolteu/kalep-react-icons/dist/LogoInstagram"
import LogoTiktok from "@bolteu/kalep-react-icons/dist/LogoTiktok"
import Pin from "@bolteu/kalep-react-icons/dist/Pin"
import Receipt from "@bolteu/kalep-react-icons/dist/Receipt"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import type { ReactNode } from "react"
import { ListItem } from "@/shared/components/ListItem"
import { googleMapsSearchUrl } from "@/shared/utils/googleMapsSearchUrl"
import { toTelHref } from "@/shared/utils/telHref"

const ROW_ICON_CLASS = "size-6 shrink-0"

/** Figma About venue link rows (reserve / social) — 56px min touch height. */
const LINK_ROW_CLASS = "min-h-[56px] justify-center"

/** Figma `16643:33363` — About venue list copy. */
const ABOUT_MENU_ROW_VALUE = "Menu" as const
const ABOUT_MENU_ROW_LABEL = "Browse dishes and prices" as const
const ABOUT_PHONE_ROW_LABEL = "Phone number" as const
const ABOUT_WEBSITE_ROW_LABEL = "Website" as const

export interface VenueInfoRowsProps {
  isOpenNow: boolean
  /** Hours row subtitle, e.g. `Closes 23:00`. */
  hoursRowSubtitle: string
  menuUrl: string
  address: string
  phone: string
  website: string
  openExternalUrl: (url: string) => void
  /** Opens the shared opening-hours bottom sheet (hours row). */
  onOpenHours?: () => void
  /** When set, menu row opens the in-app menu gallery instead of `menuUrl`. */
  onOpenMenuGallery?: () => void
  reserveUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  facebookUrl?: string
}

function websiteDisplayLabel(website: string): string {
  try {
    const u = new URL(
      website.startsWith("http") ? website : `https://${website}`,
    )
    return u.hostname
  } catch {
    return website.replace(/^https?:\/\//, "")
  }
}

function websiteHref(website: string): string {
  return website.startsWith("http") ? website : `https://${website}`
}

function VenueLinkRow({
  icon,
  label,
  href,
  onPress,
  openExternalUrl,
}: {
  icon: ReactNode
  label: string
  href?: string
  onPress?: () => void
  openExternalUrl: (url: string) => void
}) {
  return (
    <li className="m-0 p-0">
      {href ?
        <ListItem
          icon={icon}
          iconTone="primary"
          lineOrder="valueFirst"
          value={label}
          label=""
          href={href}
          horizontalPadding="none"
          showSeparator={false}
          className={LINK_ROW_CLASS}
          onAnchorClick={(e) => {
            e.preventDefault()
            openExternalUrl(href)
          }}
          aria-label={label}
        />
      : <ListItem
          icon={icon}
          iconTone="primary"
          lineOrder="valueFirst"
          value={label}
          label=""
          interactive={Boolean(onPress)}
          onPress={onPress}
          horizontalPadding="none"
          showSeparator={false}
          className={LINK_ROW_CLASS}
          aria-label={label}
        />
      }
    </li>
  )
}

/**
 * About venue info list (Figma `16643:33363`): hours, menu, address, phone, website,
 * then optional reserve / social rows.
 */
export function VenueInfoRows({
  isOpenNow,
  hoursRowSubtitle,
  menuUrl,
  address,
  phone,
  website,
  openExternalUrl,
  onOpenHours,
  onOpenMenuGallery,
  reserveUrl,
  instagramUrl,
  tiktokUrl,
  facebookUrl,
}: VenueInfoRowsProps) {
  const telHref = toTelHref(phone)
  const mapsUrl = googleMapsSearchUrl(address)
  const siteHref = websiteHref(website)
  const hoursStatusLabel = isOpenNow ? "Open now" : "Closed"

  return (
    <ul className="m-0 flex list-none flex-col px-6 p-0 pb-6 [&>li:not(:last-child)]:border-b [&>li:not(:last-child)]:border-solid [&>li:not(:last-child)]:border-separator">
      <li className="m-0 p-0">
        <ListItem
          icon={<Time size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          iconTone="primary"
          lineOrder="valueFirst"
          value={hoursStatusLabel}
          label={hoursRowSubtitle}
          showChevron
          interactive={Boolean(onOpenHours)}
          onPress={onOpenHours}
          horizontalPadding="none"
          showSeparator={false}
          aria-label={
            onOpenHours
              ? `Opening hours, ${hoursStatusLabel}, ${hoursRowSubtitle}`
              : undefined
          }
          labelColor={isOpenNow ? "secondary" : "tertiary"}
        />
      </li>
      <li className="m-0 p-0">
        {onOpenMenuGallery ?
          <ListItem
            icon={<Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label={ABOUT_MENU_ROW_LABEL}
            value={ABOUT_MENU_ROW_VALUE}
            interactive
            onPress={onOpenMenuGallery}
            horizontalPadding="none"
            showSeparator={false}
            aria-label={`${ABOUT_MENU_ROW_VALUE}, ${ABOUT_MENU_ROW_LABEL}`}
          />
        : <ListItem
            icon={<Receipt size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label={ABOUT_MENU_ROW_LABEL}
            value={ABOUT_MENU_ROW_VALUE}
            href={menuUrl}
            horizontalPadding="none"
            showSeparator={false}
            onAnchorClick={(e) => {
              e.preventDefault()
              openExternalUrl(menuUrl)
            }}
            aria-label={`${ABOUT_MENU_ROW_VALUE}, ${ABOUT_MENU_ROW_LABEL}`}
          />
        }
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
        {telHref ?
          <ListItem
            icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label={ABOUT_PHONE_ROW_LABEL}
            value={phone}
            href={telHref}
            horizontalPadding="none"
            showSeparator={false}
            aria-label={`Call ${phone}`}
          />
        : <ListItem
            icon={<Call size="lg" className={ROW_ICON_CLASS} aria-hidden />}
            iconTone="primary"
            lineOrder="valueFirst"
            label={ABOUT_PHONE_ROW_LABEL}
            value={phone}
            interactive={false}
            horizontalPadding="none"
            showSeparator={false}
          />
        }
      </li>
      <li className="m-0 p-0">
        <ListItem
          icon={<Globe size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          iconTone="primary"
          lineOrder="valueFirst"
          label={ABOUT_WEBSITE_ROW_LABEL}
          value={websiteDisplayLabel(website)}
          href={siteHref}
          horizontalPadding="none"
          showSeparator={false}
          onAnchorClick={(e) => {
            e.preventDefault()
            openExternalUrl(siteHref)
          }}
          aria-label={`Open website ${websiteDisplayLabel(website)}`}
        />
      </li>
      {reserveUrl ?
        <VenueLinkRow
          icon={<Calendar size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          label="Reserve"
          href={reserveUrl}
          openExternalUrl={openExternalUrl}
        />
      : null}
      {instagramUrl ?
        <VenueLinkRow
          icon={<LogoInstagram size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          label="Instagram"
          href={instagramUrl}
          openExternalUrl={openExternalUrl}
        />
      : null}
      {tiktokUrl ?
        <VenueLinkRow
          icon={<LogoTiktok size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          label="TikTok"
          href={tiktokUrl}
          openExternalUrl={openExternalUrl}
        />
      : null}
      {facebookUrl ?
        <VenueLinkRow
          icon={<LogoFacebook size="lg" className={ROW_ICON_CLASS} aria-hidden />}
          label="Facebook"
          href={facebookUrl}
          openExternalUrl={openExternalUrl}
        />
      : null}
    </ul>
  )
}
