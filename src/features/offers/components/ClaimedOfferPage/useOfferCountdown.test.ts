import { describe, expect, it } from "vitest"
import {
  formatCountdownHms,
  formatOfferCountdownLive,
} from "./useOfferCountdown"

describe("formatCountdownHms", () => {
  it("formats as H:MM:SS with unpadded hours", () => {
    expect(formatCountdownHms(0)).toBe("0:00:00")
    expect(formatCountdownHms(59 * 1000)).toBe("0:00:59")
    expect(formatCountdownHms((59 * 60 + 20) * 1000)).toBe("0:59:20")
    expect(formatCountdownHms((60 * 60 + 59 * 60 + 20) * 1000)).toBe("1:59:20")
    expect(formatCountdownHms((23 * 3600 + 40 * 60 + 5) * 1000)).toBe(
      "23:40:05",
    )
  })
})

describe("formatOfferCountdownLive", () => {
  it("uses Hh Mm when at least 60 full minutes remain", () => {
    expect(formatOfferCountdownLive(60 * 60 * 1000)).toBe("1h 00m")
    expect(formatOfferCountdownLive((60 * 60 + 30 * 60) * 1000)).toBe("1h 30m")
    expect(formatOfferCountdownLive(90 * 60 * 1000)).toBe("1h 30m")
  })

  it("uses M:SS when under 60 minutes remain", () => {
    expect(formatOfferCountdownLive(59 * 60 * 1000 + 30 * 1000)).toBe("59:30")
    expect(formatOfferCountdownLive(3 * 60 * 1000 + 42 * 1000)).toBe("3:42")
    expect(formatOfferCountdownLive(59 * 1000)).toBe("0:59")
  })
})
