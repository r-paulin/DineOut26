import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useMemo } from "react"
import Map from "react-map-gl/maplibre"
import { attachMissingStyleImageHandler } from "@/features/map/attachMissingStyleImages"
import { DISCOVER_STREET_MAP_STYLE_URL } from "@/features/map/discoverMapStyle"
import { maplibregl } from "@/features/map/maplibreWorker"
import { MAP_DEFAULT_ZOOM } from "@/features/map/mapMarkers.data"
import { latLngForRestaurantSlug } from "@/features/map/restaurantMapPosition"
import { VenueAddressMapPin } from "@/features/restaurant/components/VenueAddressMapPin"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"

export interface VenueAddressMapSnapshotProps {
  restaurantSlug: RestaurantSlug
}

const STATIC_MAP_INTERACTION = {
  dragPan: false,
  dragRotate: false,
  scrollZoom: false,
  boxZoom: false,
  doubleClickZoom: false,
  touchZoomRotate: false,
  touchPitch: false,
  keyboard: false,
} as const

/**
 * Non-interactive MapLibre preview for the address bottom sheet (Figma `16947:60232`).
 */
export function VenueAddressMapSnapshot({
  restaurantSlug,
}: VenueAddressMapSnapshotProps) {
  const mapStyle = useMemo(() => DISCOVER_STREET_MAP_STYLE_URL, [])
  const { lat, lng } = useMemo(
    () => latLngForRestaurantSlug(restaurantSlug),
    [restaurantSlug],
  )

  const handleLoad = useCallback(
    (event: { target: import("maplibre-gl").Map }) => {
      const map = event.target
      attachMissingStyleImageHandler(map)
      map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 })
      const attrib = map
        .getContainer()
        .querySelector<HTMLElement>(".maplibregl-ctrl-attrib")
      if (attrib?.parentElement) {
        attrib.parentElement.style.display = "none"
      }
      requestAnimationFrame(() => {
        map.resize()
      })
    },
    [],
  )

  return (
    <div
      className="venue-address-map-snapshot pointer-events-none relative h-[200px] w-full min-w-0 overflow-hidden rounded-[12px] bg-neutral-secondary [&_.maplibregl-ctrl-bottom-left]:!hidden [&_.maplibregl-ctrl-bottom-right]:!hidden [&_.maplibregl-ctrl-attrib]:!hidden"
      aria-hidden
    >
      <Map
        mapLib={maplibregl}
        mapStyle={mapStyle}
        reuseMaps={import.meta.env.PROD}
        attributionControl={false}
        interactive={false}
        initialViewState={{
          longitude: lng,
          latitude: lat,
          zoom: MAP_DEFAULT_ZOOM,
        }}
        style={{ width: "100%", height: "100%" }}
        onLoad={handleLoad}
        {...STATIC_MAP_INTERACTION}
      />
      <VenueAddressMapPin />
    </div>
  )
}
