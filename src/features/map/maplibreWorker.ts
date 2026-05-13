/**
 * Vite must resolve the MapLibre worker bundle to a real URL; otherwise the map
 * can stay blank (worker fails to load from an incorrect default path).
 */
import maplibregl from "maplibre-gl"
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-csp-worker.js?url"

maplibregl.setWorkerUrl(maplibreWorkerUrl)

export { maplibregl }
