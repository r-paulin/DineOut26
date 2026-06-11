import { describe, expect, it } from "vitest"
import { PAY_SCREEN_BILL_TOTAL_LABEL } from "./payScreenCopy"

describe("payScreenCopy", () => {
  it("uses Bill total summary label", () => {
    expect(PAY_SCREEN_BILL_TOTAL_LABEL).toBe("Bill total")
  })
})
