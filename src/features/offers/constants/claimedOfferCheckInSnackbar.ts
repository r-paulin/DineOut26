import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"
import {
  CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION,
  CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE,
} from "@/features/offers/constants/claimedOfferCopy"

/** Figma `17504:35915` — auto-dismiss snackbar after venue check-in. */
export function createClaimedOfferCheckInSnackbar(): Pick<
  SnackbarContent,
  | "title"
  | "description"
  | "descriptionColor"
  | "showCloseButton"
  | "swipeToDismiss"
  | "timeout"
> {
  return {
    title: CLAIMED_OFFER_CHECK_IN_SNACKBAR_TITLE,
    description: CLAIMED_OFFER_CHECK_IN_SNACKBAR_DESCRIPTION,
    descriptionColor: "secondary-inverted",
    showCloseButton: false,
    swipeToDismiss: false,
    timeout: 5000,
  }
}
