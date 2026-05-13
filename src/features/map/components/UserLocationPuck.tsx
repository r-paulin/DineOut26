import {
  USER_LOCATION_IMG_BASE,
  USER_LOCATION_IMG_POINT,
  USER_LOCATION_IMG_RADAR,
} from "@/features/map/userLocationFigmaAssets"

/**
 * Figma `15806:67698` — layered “My Location” (base + radar + point), 64px.
 */
export function UserLocationPuck() {
  return (
    <div
      className="relative size-16 shrink-0 pointer-events-none"
      aria-hidden
    >
      <img
        alt=""
        className="pointer-events-none absolute inset-0 block size-full max-w-none"
        src={USER_LOCATION_IMG_BASE}
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-[-6.43%_21.88%_47.06%_21.88%]">
        <img
          alt=""
          className="absolute inset-0 block size-full max-w-none"
          src={USER_LOCATION_IMG_RADAR}
          draggable={false}
        />
      </div>
      <div className="pointer-events-none absolute inset-[31.25%]">
        <div className="absolute inset-[-16.67%_-25%_-33.33%_-25%]">
          <img
            alt=""
            className="block size-full max-w-none"
            src={USER_LOCATION_IMG_POINT}
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
