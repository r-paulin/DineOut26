import { describe, expect, it } from "vitest"
import {
  heroBandHeightForSheetInset,
  resolveConfirmSheetInsetPx,
} from "./paymentConfirmationLayout"

describe("resolveConfirmSheetInsetPx", () => {
  it("uses measured height when layout is ready", () => {
    expect(resolveConfirmSheetInsetPx(420, 600, 800)).toBe(420)
  })

  it("falls back when Firefox reports 0 before layout", () => {
    expect(resolveConfirmSheetInsetPx(0, 576, 800)).toBe(440)
  })

  it("caps at the viewport maximum", () => {
    expect(resolveConfirmSheetInsetPx(900, 576, 800)).toBe(576)
  })
})

describe("heroBandHeightForSheetInset", () => {
  it("subtracts sheet inset from host height", () => {
    expect(heroBandHeightForSheetInset(800, 446)).toBe(354)
  })
})
