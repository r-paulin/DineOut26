import { describe, expect, it } from "vitest"
import { shouldUpdateSnackbarInsetPx } from "@/shared/snackbar/snackbarInset"

/**
 * Regression: discover sheet drag emits many 1px dock heights; inset updates
 * must be suppressed below threshold so Sonner does not jitter.
 */
describe("snackbar inset stability during dock resize", () => {
  it("applies at most one effective update per threshold band", () => {
    let applied = 72
    let updateCount = 0
    const heights = [420, 421, 422, 425, 430, 431]

    for (const h of heights) {
      if (shouldUpdateSnackbarInsetPx(applied, h)) {
        applied = h
        updateCount += 1
      }
    }

    expect(updateCount).toBeLessThan(heights.length)
    expect(updateCount).toBe(4)
    expect(applied).toBe(430)
  })
})
