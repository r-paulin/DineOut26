import { Button, Typography } from "@bolteu/kalep-react"

export interface PayBillFlowErrorFallbackProps {
  onDismiss: () => void
  onRetryBillAmount: () => void
}

/** Shown when pay store step/data is inconsistent (avoids blank z-120 overlay). */
export function PayBillFlowErrorFallback({
  onDismiss,
  onRetryBillAmount,
}: PayBillFlowErrorFallbackProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6 px-6">
      <Typography variant="heading-m-accent" color="primary" as="h1" align="center">
        Something went wrong
      </Typography>
      <Typography variant="body-m-regular" color="secondary" as="p" align="center">
        We could not load this step. You can go back to the bill amount or leave pay.
      </Typography>
      <div className="flex w-full max-w-[20rem] flex-col gap-2">
        <Button fullWidth variant="primary" size="lg" onClick={onRetryBillAmount}>
          Back to bill amount
        </Button>
        <Button fullWidth variant="secondary" size="lg" onClick={onDismiss}>
          Leave pay
        </Button>
      </div>
    </div>
  )
}
