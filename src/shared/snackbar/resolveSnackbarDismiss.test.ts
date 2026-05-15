import { describe, expect, it } from "vitest"
import { resolveSnackbarDismiss } from "./resolveSnackbarDismiss"

describe("resolveSnackbarDismiss", () => {
  it("shows close by default and allows swipe", () => {
    expect(resolveSnackbarDismiss({ description: "Hi" })).toEqual({
      showCloseButton: true,
      swipeToDismiss: true,
      timeoutMs: 5000,
    })
  })

  it("legacy dismissible false disables swipe but keeps close", () => {
    expect(
      resolveSnackbarDismiss({
        description: "Tip added",
        dismissible: false,
        timeout: 3500,
      }),
    ).toEqual({
      showCloseButton: true,
      swipeToDismiss: false,
      timeoutMs: 3500,
    })
  })

  it("hides close only when showCloseButton is false", () => {
    expect(
      resolveSnackbarDismiss({
        description: "Hidden",
        showCloseButton: false,
      }),
    ).toEqual({
      showCloseButton: false,
      swipeToDismiss: true,
      timeoutMs: 5000,
    })
  })

  it("allows swipe override when dismissible is false", () => {
    expect(
      resolveSnackbarDismiss({
        description: "Swipe ok",
        dismissible: false,
        swipeToDismiss: true,
      }),
    ).toMatchObject({ swipeToDismiss: true, showCloseButton: true })
  })
})
