import { describe, expect, it } from "vitest"
import { createPaymentCode } from "./paymentCodeDisplay"

describe("createPaymentCode", () => {
  it("returns a 4-digit string", () => {
    for (let i = 0; i < 20; i++) {
      const code = createPaymentCode()
      expect(code).toMatch(/^\d{4}$/)
      expect(Number(code)).toBeGreaterThanOrEqual(1000)
      expect(Number(code)).toBeLessThanOrEqual(9999)
    }
  })
})
