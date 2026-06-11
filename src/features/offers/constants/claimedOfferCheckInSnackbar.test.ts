import { describe, expect, it } from "vitest"
import { createClaimedOfferCheckInSnackbar } from "./claimedOfferCheckInSnackbar"

describe("createClaimedOfferCheckInSnackbar", () => {
  it("matches Figma 17504:35915 copy and dismiss rules", () => {
    expect(createClaimedOfferCheckInSnackbar()).toEqual({
      title: "You're checked in",
      description: "Show your PIN to the staff and enjoy your meal as usual",
      descriptionColor: "secondary-inverted",
      showCloseButton: false,
      swipeToDismiss: false,
      timeout: 5000,
    })
  })
})
