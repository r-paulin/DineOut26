/** Four-digit code shown to the waiter after payment (prototype). */
export function createPaymentCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}
