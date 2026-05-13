import { describe, expect, it } from "vitest"
import { formatOfferCountdownLive } from "./useOfferCountdown"

describe("formatOfferCountdownLive", () => {
  it("uses Hh Mm Ss when at least 60 full minutes remain", () => {
    expect(formatOfferCountdownLive(60 * 60 * 1000)).toBe("1h 00m 00s")
    expect(formatOfferCountdownLive((60 * 60 + 30 * 60) * 1000)).toBe("1h 30m 00s")
    expect(formatOfferCountdownLive(90 * 60 * 1000)).toBe("1h 30m 00s")
    expect(formatOfferCountdownLive(61 * 60 * 1000 + 5 * 1000)).toBe("1h 01m 05s")
  })

  it("uses M:SS when under 60 minutes remain", () => {
    expect(formatOfferCountdownLive(59 * 60 * 1000 + 30 * 1000)).toBe("59:30")
    expect(formatOfferCountdownLive(3 * 60 * 1000 + 42 * 1000)).toBe("3:42")
    expect(formatOfferCountdownLive(59 * 1000)).toBe("0:59")
  })
})
