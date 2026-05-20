import { describe, expect, it } from "vitest"
import {
  CLAIM_PIN_UNAVAILABLE_MESSAGE,
  parseClaimPinForDisplay,
} from "./parseClaimPinForDisplay"

describe("parseClaimPinForDisplay", () => {
  it("accepts digit-only PINs within max length", () => {
    expect(parseClaimPinForDisplay("4829")).toEqual({
      ok: true,
      digits: ["4", "8", "2", "9"],
    })
  })

  it("rejects non-digit PINs", () => {
    expect(parseClaimPinForDisplay("12ab")).toEqual({
      ok: false,
      message: CLAIM_PIN_UNAVAILABLE_MESSAGE,
    })
  })

  it("rejects PINs longer than max digits", () => {
    expect(parseClaimPinForDisplay("123456789")).toEqual({
      ok: false,
      message: CLAIM_PIN_UNAVAILABLE_MESSAGE,
    })
  })
})
