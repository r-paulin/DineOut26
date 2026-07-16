import { describe, expect, it } from "vitest"
import { venueCountLabel } from "./venueCountLabel"

describe("venueCountLabel", () => {
  it("formats singular and plural", () => {
    expect(venueCountLabel(1)).toBe("1 venue")
    expect(venueCountLabel(6)).toBe("6 venues")
    expect(venueCountLabel(0)).toBe("0 venues")
  })
})
