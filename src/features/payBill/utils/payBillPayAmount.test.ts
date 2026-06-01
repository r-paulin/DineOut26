import { describe, expect, it } from "vitest"
import { cashbackAmountEur, payAmountDue } from "./discountCalc"

describe("payAmountDue and cashbackAmountEur", () => {
  it("DineOut: net receipt + tip is amount due; cashback is % of subtotal", () => {
    expect(payAmountDue(12, 0.6, 0)).toBe(12.6)
    expect(cashbackAmountEur(12, 0.6, 15)).toBe(1.89)
  })

  it("card/cash at venue: claimed % reduces pay; no cashback add-on", () => {
    expect(payAmountDue(50, 5, 30)).toBe(38.5)
    expect(cashbackAmountEur(50, 5, 0)).toBe(0)
  })
})
