import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"
import { CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION } from "@/features/offers/constants/claimedOfferCopy"
import { formatWelcomeAtRestaurant } from "@/features/offers/components/ClaimedOfferPage/claimedOfferShared"

/** Figma `19867:38064` — auto-dismiss snackbar after venue check-in. */
export function createClaimedOfferCheckInSnackbar(
  restaurantName: string,
): Pick<
  SnackbarContent,
  | "title"
  | "description"
  | "descriptionColor"
  | "showCloseButton"
  | "swipeToDismiss"
  | "timeout"
> {
  return {
    title: formatWelcomeAtRestaurant(restaurantName),
    description: CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION,
    descriptionColor: "secondary-inverted",
    showCloseButton: false,
    swipeToDismiss: false,
    timeout: 5000,
  }
}
