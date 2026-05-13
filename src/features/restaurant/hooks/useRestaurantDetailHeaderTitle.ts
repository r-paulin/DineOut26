import { useCallback, useState } from "react"

const FADE_START = 48
const FADE_END = 120

/**
 * Maps scroll position to center nav title opacity (hidden at top, fades in while scrolling).
 */
export function useRestaurantDetailHeaderTitle() {
  const [titleOpacity, setTitleOpacity] = useState(0)

  const onScroll = useCallback((scrollTop: number) => {
    if (scrollTop <= FADE_START) {
      setTitleOpacity(0)
      return
    }
    if (scrollTop >= FADE_END) {
      setTitleOpacity(1)
      return
    }
    setTitleOpacity((scrollTop - FADE_START) / (FADE_END - FADE_START))
  }, [])

  const reset = useCallback(() => {
    setTitleOpacity(0)
  }, [])

  return { titleOpacity, onScroll, reset }
}
