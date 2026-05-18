import { DISCOVER_STREET_MAP_STYLE_URL } from "@/features/map/discoverMapStyle"
import { MOCK_USER_LOCATION } from "@/features/map/mapMarkers.data"
import {
  USER_LOCATION_IMG_BASE,
  USER_LOCATION_IMG_POINT,
  USER_LOCATION_IMG_RADAR,
} from "@/features/map/userLocationAssets"
import { createLogger } from "@/shared/utils/logger"

const prefetchLog = createLogger("map.prefetch")

/** Web Mercator tile indices for a WGS84 point at integer zoom `z`. */
export function lngLatToTileXY(
  lng: number,
  lat: number,
  z: number,
): { x: number; y: number } {
  const n = 2 ** z
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(
    ((1 -
      Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) /
      2) *
      n,
  )
  return { x, y }
}

function expandVectorTileUrl(
  template: string,
  z: number,
  x: number,
  y: number,
): string {
  return template
    .replace(/{z}/g, String(z))
    .replace(/{x}/g, String(x))
    .replace(/{y}/g, String(y))
}

/** Warm HTTP cache for the MapLibre style JSON (small, parsed on map init). */
function prefetchDiscoverMapStyleJson(): void {
  void fetch(DISCOVER_STREET_MAP_STYLE_URL, {
    mode: "cors",
    credentials: "omit",
  }).catch((err: unknown) => {
    prefetchLog.debug("style JSON prefetch failed", err)
  })
}

/**
 * Fetches OpenFreeMap `planet` TileJSON, then GETs a 3×3 block of native vector
 * tiles around Vecrīga so the first paint reuses cache when zoom > source max.
 */
async function prefetchVectorTilesAroundMockUser(): Promise<void> {
  let template: string
  let maxZ: number
  try {
    const res = await fetch("https://tiles.openfreemap.org/planet", {
      mode: "cors",
      credentials: "omit",
    })
    if (!res.ok) return
    const j = (await res.json()) as { tiles?: string[]; maxzoom?: number }
    const t = j.tiles?.[0]
    if (!t) return
    template = t
    maxZ = typeof j.maxzoom === "number" ? j.maxzoom : 14
  } catch {
    return
  }

  const z = Math.max(0, Math.min(14, maxZ))
  const { x: x0, y: y0 } = lngLatToTileXY(
    MOCK_USER_LOCATION.lng,
    MOCK_USER_LOCATION.lat,
    z,
  )
  const cap = 2 ** z
  const urls: string[] = []
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      const x = x0 + dx
      const y = y0 + dy
      if (x >= 0 && y >= 0 && x < cap && y < cap) {
        urls.push(expandVectorTileUrl(template, z, x, y))
      }
    }
  }
  await Promise.allSettled(
    urls.map((u) => fetch(u, { mode: "cors", credentials: "omit" })),
  )
}

/** Warm cache for bundled “My Location” layers before the map chunk paints. */
export function prefetchUserLocationAssets(): void {
  for (const src of [
    USER_LOCATION_IMG_BASE,
    USER_LOCATION_IMG_RADAR,
    USER_LOCATION_IMG_POINT,
  ]) {
    const img = new Image()
    img.decoding = "async"
    if ("fetchPriority" in img) {
      ;(img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
        "high"
    }
    img.src = src
  }
}

/**
 * Prime discover map: user marker assets + style JSON + vector tiles at mock
 * Vecrīga. Call as early as possible (e.g. from `main.tsx`).
 */
export function scheduleDiscoverMapWarmup(): void {
  prefetchUserLocationAssets()
  prefetchDiscoverMapStyleJson()
  const runVectorPrefetch = () => {
    void prefetchVectorTilesAroundMockUser()
  }
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(runVectorPrefetch, { timeout: 2_500 })
  } else {
    queueMicrotask(runVectorPrefetch)
  }
}
