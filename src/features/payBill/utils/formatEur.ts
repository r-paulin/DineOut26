import { round2 } from "./discountCalc"

/** Display string like `50,00 €` from major-unit amount. */
export function formatEurMajor(amount: number): string {
  const a = round2(amount)
  const neg = a < 0
  const abs = Math.abs(a)
  const whole = Math.floor(abs + 1e-9)
  const frac = Math.round((abs - whole) * 100)
  const fracStr = String(frac).padStart(2, "0")
  const core = `${whole},${fracStr} €`
  return neg ? `−${core}` : core
}
