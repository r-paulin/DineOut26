import { useEffect, useState } from "react"

function readCoarsePointer(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(pointer: coarse)").matches
}

/**
 * True when the primary pointer is coarse (typical touch device).
 * Used to choose native on-screen keyboard vs desktop keyboard entry.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(readCoarsePointer)

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)")
    const sync = () => setCoarse(mq.matches)
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return coarse
}
