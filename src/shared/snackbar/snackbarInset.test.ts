import { describe, expect, it, vi } from "vitest"
import {
  measureSnackbarInsetFromElement,
  resolveSnackbarLayoutBaseline,
} from "@/shared/snackbar/snackbarInset"

vi.mock("@/features/offers/utils/bottomSheetLayout", () => ({
  readAppHeightPx: () => 800,
  readCssLengthPx: (_prop: string, fallback: number) => fallback,
  readNavLayoutOffsetPx: () => 72,
}))

function rect(partial: Partial<DOMRect>): DOMRect {
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
    ...partial,
  } as DOMRect
}

describe("measureSnackbarInsetFromElement", () => {
  it("returns distance from shell bottom to element top", () => {
    const shell = {
      getBoundingClientRect: () => rect({ bottom: 900 }),
    } as HTMLElement

    const anchor = {
      closest: () => shell,
      getBoundingClientRect: () => rect({ top: 820 }),
    } as unknown as HTMLElement

    expect(measureSnackbarInsetFromElement(anchor)).toBe(80)
  })

  it("falls back to app height when shell is missing", () => {
    const anchor = {
      closest: () => null,
      getBoundingClientRect: () => rect({ top: 760 }),
    } as unknown as HTMLElement

    expect(measureSnackbarInsetFromElement(anchor)).toBe(40)
  })
})

describe("resolveSnackbarLayoutBaseline", () => {
  it("prefers discover dock height when dock is active", () => {
    expect(
      resolveSnackbarLayoutBaseline({
        discoverDockActive: true,
        discoverDockBottomInsetPx: 420,
        showBottomNav: true,
      }),
    ).toBe(420)
  })

  it("uses nav offset when only bottom nav is shown", () => {
    expect(
      resolveSnackbarLayoutBaseline({
        discoverDockActive: false,
        discoverDockBottomInsetPx: null,
        showBottomNav: true,
      }),
    ).toBe(72)
  })

  it("falls back to safe area when no dock or nav", () => {
    expect(
      resolveSnackbarLayoutBaseline({
        discoverDockActive: false,
        discoverDockBottomInsetPx: null,
        showBottomNav: false,
      }),
    ).toBe(0)
  })
})
