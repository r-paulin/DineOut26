import type { SnackbarContent } from "@/shared/snackbar/snackbar.types"

/**
 * Figma `15852:11328` / `15989:11792` — home snackbar after payment confirmation Done.
 *
 * Returns a fresh object on every call so `actions` is never shared across
 * `snackbar.add()` invocations (the snackbar layer may decorate them).
 */
export function createPostPaymentHomeSnackbar(
  onLeaveReview: () => void,
): Pick<
  SnackbarContent,
  "title" | "description" | "actions" | "timeout"
> {
  return {
    title: "Thanks for dining with us",
    description: "Leave a quick review to share your feedback",
    actions: [{ label: "Leave a review", onClick: onLeaveReview }],
    timeout: 5000,
  }
}
