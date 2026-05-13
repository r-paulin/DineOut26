import "maplibre-gl/dist/maplibre-gl.css"
import type { RefObject } from "react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import Map, { Marker, type MapRef } from "react-map-gl/maplibre"
import type {
  Map as MaplibreMap,
  MapLayerMouseEvent,
  MapLayerTouchEvent,
} from "maplibre-gl"
import { maplibregl } from "@/features/map/maplibreWorker"
import type { SheetSnap } from "@/features/offers/offers.types"
import {
  heightForSnap,
  readAppHeightPx,
  readNavLayoutOffsetPx,
  readSearchStackPx,
} from "@/features/offers/utils/bottomSheetLayout"
import type { MapMarkerData } from "@/features/map/map.types"
import {
  MAP_DEFAULT_ZOOM,
  MOCK_USER_LOCATION,
} from "@/features/map/mapMarkers.data"
import { attachMissingStyleImageHandler } from "@/features/map/attachMissingStyleImages"
import { DISCOVER_STREET_MAP_STYLE_URL } from "@/features/map/discoverMapStyle"
import { MapPinContent } from "./MapPinContent"
import { MapRecenterFab } from "./MapRecenterFab"
import { UserLocationPuck } from "./UserLocationPuck"

const RECENTER_THRESHOLD = 0.00015

export interface MapLayerProps {
  selectedMarkerId: string | null
  onMarkerClick: (marker: MapMarkerData) => void
  onMapBackgroundClick?: () => void
  sheetSnap: SheetSnap
  /**
   * Height (px) of the floating map restaurant card stack above the nav
   * (`px-3` + card). When > 0, used instead of the bottom sheet height for
   * viewport padding / recenter FAB.
   */
  mapFloatingOverlayHeightPx: number
  /** Pre-filtered offer-derived markers (one pin per restaurant). */
  markers: MapMarkerData[]
  /** Bumps when discover `--search-stack-height` is remeasured (map padding / FAB). */
  discoverLayoutEpoch?: number
  /**
   * When set (docked discover: sheet + nav stack), MapLibre bottom padding uses
   * this measured height so the camera centers in the visible map band.
   */
  discoverDockBottomInsetPx?: number | null
}

function centerDiffersFromUser(
  center: { lng: number; lat: number },
): boolean {
  return (
    Math.abs(center.lat - MOCK_USER_LOCATION.lat) > RECENTER_THRESHOLD ||
    Math.abs(center.lng - MOCK_USER_LOCATION.lng) > RECENTER_THRESHOLD
  )
}

/** Inset the map “safe” rect so `easeTo`/`getCenter` match visible area above sheet/card + below search. */
function viewportPaddingForDiscover(
  snap: SheetSnap,
  mapFloatingOverlayHeightPx: number,
  discoverDockBottomInsetPx: number | null | undefined,
) {
  const appH = readAppHeightPx()
  let bottom: number
  if (mapFloatingOverlayHeightPx > 0) {
    bottom = readNavLayoutOffsetPx() + mapFloatingOverlayHeightPx
  } else if (
    discoverDockBottomInsetPx != null &&
    discoverDockBottomInsetPx > 0 &&
    Number.isFinite(discoverDockBottomInsetPx)
  ) {
    bottom = discoverDockBottomInsetPx
  } else {
    bottom = readNavLayoutOffsetPx() + heightForSnap(snap, appH)
  }
  return {
    top: readSearchStackPx(),
    bottom,
    left: 0,
    right: 0,
  }
}

function getMapInstance(ref: RefObject<MapRef | null>): MaplibreMap | null {
  return ref.current?.getMap() ?? null
}

/** After layout / CSS transform, MapLibre often needs an explicit resize or tiles stay blank. */
function scheduleMapResize(map: MaplibreMap | null) {
  if (!map) return
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      map.resize()
    })
  })
}

/**
 * MapLibre vector basemap; markers and user puck are georeferenced (pan/zoom sync).
 */
export function MapLayer({
  selectedMarkerId,
  onMarkerClick,
  onMapBackgroundClick,
  sheetSnap,
  mapFloatingOverlayHeightPx,
  markers,
  discoverLayoutEpoch = 0,
  discoverDockBottomInsetPx = null,
}: MapLayerProps) {
  const mapRef = useRef<MapRef>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapTouchStartRef = useRef<{ x: number; y: number } | null>(null)
  const lastMapBackgroundTapAtRef = useRef(0)
  const mapStyle = useMemo(() => DISCOVER_STREET_MAP_STYLE_URL, [])
  const [showRecenter, setShowRecenter] = useState(false)

  const recenterBottomPx = useMemo(() => {
    let stackBottom: number
    if (mapFloatingOverlayHeightPx > 0) {
      stackBottom = readNavLayoutOffsetPx() + mapFloatingOverlayHeightPx
    } else if (
      discoverDockBottomInsetPx != null &&
      discoverDockBottomInsetPx > 0 &&
      Number.isFinite(discoverDockBottomInsetPx)
    ) {
      stackBottom = discoverDockBottomInsetPx
    } else {
      const appH = readAppHeightPx()
      stackBottom =
        readNavLayoutOffsetPx() + heightForSnap(sheetSnap, appH)
    }
    return stackBottom + 16
  }, [
    sheetSnap,
    mapFloatingOverlayHeightPx,
    discoverLayoutEpoch,
    discoverDockBottomInsetPx,
  ])

  const applyViewportPaddingAndCenter = useCallback(
    (snap: SheetSnap, opts?: { animate?: boolean }) => {
      const map = getMapInstance(mapRef)
      if (!map) return
      const padding = viewportPaddingForDiscover(
        snap,
        mapFloatingOverlayHeightPx,
        discoverDockBottomInsetPx,
      )
      const focused =
        selectedMarkerId != null
          ? markers.find((m) => m.id === selectedMarkerId)
          : null
      const center: [number, number] = focused
        ? [focused.lng, focused.lat]
        : [MOCK_USER_LOCATION.lng, MOCK_USER_LOCATION.lat]
      const zoom = MAP_DEFAULT_ZOOM
      if (opts?.animate === false) {
        map.jumpTo({ center, zoom, padding })
      } else {
        map.easeTo({
          center,
          zoom,
          padding,
          duration: 280,
          essential: true,
        })
      }
    },
    [mapFloatingOverlayHeightPx, markers, selectedMarkerId, discoverLayoutEpoch, discoverDockBottomInsetPx],
  )

  useEffect(() => {
    const map = getMapInstance(mapRef)
    if (!map) return
    applyViewportPaddingAndCenter(sheetSnap, { animate: true })
    scheduleMapResize(map)
  }, [sheetSnap, mapFloatingOverlayHeightPx, applyViewportPaddingAndCenter, discoverLayoutEpoch])

  useLayoutEffect(() => {
    const el = mapContainerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      getMapInstance(mapRef)?.resize()
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const updateRecenterVisibility = useCallback(() => {
    const map = getMapInstance(mapRef)
    if (!map) return
    const c = map.getCenter()
    setShowRecenter(centerDiffersFromUser(c))
  }, [])

  const handleMoveEnd = useCallback(() => {
    updateRecenterVisibility()
  }, [updateRecenterVisibility])

  const handleRecenter = useCallback(() => {
    const map = getMapInstance(mapRef)
    if (!map) return
    const padding = viewportPaddingForDiscover(
      sheetSnap,
      mapFloatingOverlayHeightPx,
      discoverDockBottomInsetPx,
    )
    map.flyTo({
      center: [MOCK_USER_LOCATION.lng, MOCK_USER_LOCATION.lat],
      zoom: MAP_DEFAULT_ZOOM,
      padding,
      duration: 550,
      essential: true,
    })
    setShowRecenter(false)
  }, [sheetSnap, mapFloatingOverlayHeightPx, discoverDockBottomInsetPx, discoverLayoutEpoch])

  const mapGesturesEnabled = sheetSnap !== "peek"

  const syncMapInteractionHandlers = useCallback(
    (map: MaplibreMap) => {
      const handlers = [
        map.dragPan,
        map.scrollZoom,
        map.touchZoomRotate,
        map.doubleClickZoom,
        map.keyboard,
        map.dragRotate,
        map.boxZoom,
      ] as const
      for (const h of handlers) {
        if (mapGesturesEnabled) h.enable()
        else h.disable()
      }
    },
    [mapGesturesEnabled],
  )

  useEffect(() => {
    const map = getMapInstance(mapRef)
    if (!map) return
    syncMapInteractionHandlers(map)
  }, [sheetSnap, syncMapInteractionHandlers])

  const fireMapBackgroundTap = useCallback(() => {
    const now = Date.now()
    if (now - lastMapBackgroundTapAtRef.current < 400) return
    lastMapBackgroundTapAtRef.current = now
    onMapBackgroundClick?.()
  }, [onMapBackgroundClick])

  const handleMapClick = useCallback((_e: MapLayerMouseEvent) => {
    fireMapBackgroundTap()
  }, [fireMapBackgroundTap])

  const handleMapTouchStart = useCallback((e: MapLayerTouchEvent) => {
    const t = e.originalEvent.touches[0]
    if (!t) {
      mapTouchStartRef.current = null
      return
    }
    mapTouchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleMapTouchEnd = useCallback(
    (e: MapLayerTouchEvent) => {
      const te = e.originalEvent
      if (te.changedTouches.length !== 1) {
        mapTouchStartRef.current = null
        return
      }
      const t = te.changedTouches[0]!
      const start = mapTouchStartRef.current
      mapTouchStartRef.current = null
      if (!start) return
      const dx = t.clientX - start.x
      const dy = t.clientY - start.y
      if (dx * dx + dy * dy > 28 * 28) return
      fireMapBackgroundTap()
    },
    [fireMapBackgroundTap],
  )

  return (
    <div className="absolute inset-0 z-[1]">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 bg-neutral-secondary min-h-0 min-w-0"
      >
        {/* Map reuse off in dev (StrictMode + reuse amplifies worker noise). POIs: attachMissingStyleImageHandler */}
        <Map
          ref={mapRef}
          reuseMaps={import.meta.env.PROD}
          mapLib={maplibregl}
          mapStyle={mapStyle}
          initialViewState={{
            longitude: MOCK_USER_LOCATION.lng,
            latitude: MOCK_USER_LOCATION.lat,
            zoom: MAP_DEFAULT_ZOOM,
          }}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          onTouchStart={handleMapTouchStart}
          onTouchEnd={handleMapTouchEnd}
          onMoveEnd={handleMoveEnd}
          onLoad={() => {
            const map = getMapInstance(mapRef)
            if (map) {
              attachMissingStyleImageHandler(map)
              scheduleMapResize(map)
              syncMapInteractionHandlers(map)
            }
            requestAnimationFrame(() => {
              applyViewportPaddingAndCenter(sheetSnap, { animate: false })
              updateRecenterVisibility()
            })
          }}
        >
          {markers.map((m) => (
            <Marker
              key={m.id}
              longitude={m.lng}
              latitude={m.lat}
              anchor="bottom"
            >
              <button
                type="button"
                className="pointer-events-auto relative z-[1] block cursor-pointer border-none bg-transparent p-0"
                aria-label={m.label}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkerClick(m)
                }}
              >
                <MapPinContent
                  marker={m}
                  selected={selectedMarkerId === m.id}
                />
              </button>
            </Marker>
          ))}
          <Marker
            longitude={MOCK_USER_LOCATION.lng}
            latitude={MOCK_USER_LOCATION.lat}
            anchor="center"
          >
            <UserLocationPuck />
          </Marker>
        </Map>
        <MapRecenterFab
          visible={showRecenter}
          bottomPx={recenterBottomPx}
          onClick={handleRecenter}
        />
      </div>
    </div>
  )
}
