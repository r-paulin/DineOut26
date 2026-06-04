import Store from "@bolteu/kalep-react-icons/dist/Store"

/**
 * Centered venue pin for the address sheet map snapshot.
 * Figma `16947:60238` — 40×52 map pin, store icon on dark circle + ground dot.
 */
export function VenueAddressMapPin() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[52px] w-10 -translate-x-1/2 -translate-y-full"
      aria-hidden
    >
      <div className="flex h-full flex-col items-center [filter:drop-shadow(0_0.25rem_0.375rem_rgba(0,0,0,0.2))]">
        <div className="relative z-[2] flex size-10 shrink-0 items-center justify-center rounded-full bg-static-key-dark">
          <Store size="md" className="text-static-key-light" aria-hidden />
        </div>
        <div className="relative z-[1] -mt-0.5 size-2 shrink-0 rounded-full bg-static-key-dark" />
      </div>
    </div>
  )
}
