import { describe, expect, it } from "vitest"
import { createClaimedOfferCheckInSnackbar } from "./claimedOfferCheckInSnackbar"

describe("createClaimedOfferCheckInSnackbar", () => {
  it("matches Figma 19867:38064 welcome snackbar copy and dismiss rules", () => {
    expect(createClaimedOfferCheckInSnackbar("3 Pavāru Restorāns")).toEqual({
      title: "Welcome at 3 Pavāru Restorāns",
      description: "Dine as usual and ask for the bill when you're ready",
      descriptionColor: "secondary-inverted",
      showCloseButton: false,
      swipeToDismiss: false,
      timeout: 5000,
    })
  })
})
