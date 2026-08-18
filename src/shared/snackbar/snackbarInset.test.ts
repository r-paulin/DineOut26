import { describe, expect, it, vi } from "vitest"
import {
  isSnackbarAnchorMeasurable,
  measureMaxSnackbarAnchorInset,
  measureSnackbarInsetFromElement,
  resolveSnackbarLayoutBaseline,
  shouldUpdateSnackbarInsetPx,
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

describe("shouldUpdateSnackbarInsetPx", () => {
  it("ignores sub-threshold changes", () => {
    expect(shouldUpdateSnackbarInsetPx(100, 101)).toBe(false)
    expect(shouldUpdateSnackbarInsetPx(100, 102)).toBe(true)
  })

  it("always applies when crossing zero", () => {
    expect(shouldUpdateSnackbarInsetPx(80, 0)).toBe(true)
    expect(shouldUpdateSnackbarInsetPx(0, 80)).toBe(true)
  })

  it("skips identical values", () => {
    expect(shouldUpdateSnackbarInsetPx(50, 50)).toBe(false)
  })
})

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

describe("isSnackbarAnchorMeasurable", () => {
  it("skips zero-size nodes", () => {
    const el = {
      getBoundingClientRect: () => rect({ width: 384, height: 0 }),
    } as HTMLElement
    expect(isSnackbarAnchorMeasurable(el)).toBe(false)
  })

  it("skips visibility:hidden nodes", () => {
    const el = {
      getBoundingClientRect: () => rect({ width: 384, height: 105 }),
      checkVisibility: () => false,
    } as unknown as HTMLElement
    expect(isSnackbarAnchorMeasurable(el)).toBe(false)
  })

  it("keeps visible footers", () => {
    const el = {
      getBoundingClientRect: () => rect({ width: 384, height: 105 }),
      checkVisibility: () => true,
    } as unknown as HTMLElement
    expect(isSnackbarAnchorMeasurable(el)).toBe(true)
  })
})

describe("measureMaxSnackbarAnchorInset", () => {
  it("ignores hidden leftover footers", () => {
    const hidden = {
      getBoundingClientRect: () => rect({ width: 384, height: 105, top: 758 }),
      checkVisibility: () => false,
      closest: () => null,
    } as unknown as HTMLElement
    const dummy = {
      getBoundingClientRect: () => rect({ width: 384, height: 0, top: 863 }),
      checkVisibility: () => true,
      closest: () => null,
    } as unknown as HTMLElement
    const scope = {
      querySelectorAll: () => [hidden, dummy],
    } as unknown as ParentNode

    expect(measureMaxSnackbarAnchorInset(scope)).toBe(0)
  })
})

describe("resolveSnackbarLayoutBaseline", () => {
  it("uses nav offset when bottom nav is shown (discover dock or standalone)", () => {
    expect(resolveSnackbarLayoutBaseline({ showBottomNav: true })).toBe(72)
  })

  it("falls back to safe area when bottom nav is hidden", () => {
    expect(resolveSnackbarLayoutBaseline({ showBottomNav: false })).toBe(0)
  })
})
