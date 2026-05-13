import { useEffect, useState } from "react"

/**
 * True when the primary pointer is coarse (typical touch device).
 * Used to choose native on-screen keyboard vs desktop keyboard entry.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return coarse
}
