import type { Map as MaplibreMap } from "maplibre-gl"
import { createLogger } from "@/shared/utils/logger"

const log = createLogger("map.style")
const mapsWithHandler = new WeakSet<MaplibreMap>()

/**
 * OpenFreeMap “Liberty” (and similar OSM styles) reference many POI `icon-image`
 * ids that are not present in the bundled sprite. MapLibre logs each miss and
 * can hit noisy worker assertions; registering `styleimagemissing` silences that
 * by adding a 1×1 transparent placeholder per missing id.
 *
 * Binds when the style is ready (`style.load` if not yet loaded) so the handler
 * is active before the first style evaluation when possible.
 *
 * @see https://maplibre.org/maplibre-gl-js/docs/examples/generate-and-add-a-missing-icon-to-the-map/
 */
export function attachMissingStyleImageHandler(map: MaplibreMap): void {
  if (mapsWithHandler.has(map)) return
  mapsWithHandler.add(map)

  const onMissing = (e: { id: string }) => {
    if (map.hasImage(e.id)) return
    try {
      const data = new ImageData(1, 1)
      data.data[3] = 0
      map.addImage(e.id, data)
    } catch (err) {
      log.debug("addImage placeholder failed", e.id, err)
    }
  }

  map.on("styleimagemissing", onMissing)
}
