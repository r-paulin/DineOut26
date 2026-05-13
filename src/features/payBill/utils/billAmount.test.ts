import { describe, expect, it } from "vitest"
import {
  MAX_BILL_AMOUNT,
  applyNumpadKey,
  billNumpadStateFromCents,
  billStateFromFormattedInput,
  billStateToAmount,
  billStateToCents,
  formatAmountDisplay,
  formatBillEditableDisplay,
  initialBillNumpadState,
  isBillAmountValidForContinue,
  type NumpadKey,
} from "./billAmount"

describe("billAmount", () => {
  it("starts empty with zero cents", () => {
    const s = initialBillNumpadState()
    expect(billStateToCents(s)).toBe(0)
    expect(isBillAmountValidForContinue(s)).toBe(false)
  })

  it("types 50 as 50.00 EUR", () => {
    let s = initialBillNumpadState()
    s = applyNumpadKey(s, "5")
    s = applyNumpadKey(s, "0")
    expect(billStateToCents(s)).toBe(5000)
    expect(billStateToAmount(s)).toBe(50)
    expect(isBillAmountValidForContinue(s)).toBe(true)
  })

  it("rejects leading zero multi-digit except through decimal", () => {
    let s = initialBillNumpadState()
    s = applyNumpadKey(s, "0")
    s = applyNumpadKey(s, "5")
    expect(s.intPart).toBe("5")
    expect(billStateToCents(s)).toBe(500)
  })

  it("supports decimal and two fractional digits", () => {
    let s = initialBillNumpadState()
    s = applyNumpadKey(s, "3")
    s = applyNumpadKey(s, ".")
    s = applyNumpadKey(s, "5")
    s = applyNumpadKey(s, "0")
    expect(billStateToCents(s)).toBe(350)
    expect(billStateToAmount(s)).toBe(3.5)
  })

  it("caps at MAX_BILL_AMOUNT", () => {
    let s = initialBillNumpadState()
    for (const d of "9999") s = applyNumpadKey(s, d as "9")
    s = applyNumpadKey(s, ".")
    s = applyNumpadKey(s, "9")
    s = applyNumpadKey(s, "9")
    expect(billStateToAmount(s)).toBe(MAX_BILL_AMOUNT)
    const blocked = applyNumpadKey(s, "1")
    expect(blocked).toEqual(s)
  })

  it("backspace removes fractional then exits decimal mode", () => {
    let s = initialBillNumpadState()
    s = applyNumpadKey(s, "1")
    s = applyNumpadKey(s, ".")
    s = applyNumpadKey(s, "2")
    s = applyNumpadKey(s, "backspace")
    expect(s.fracPart).toBe("")
    s = applyNumpadKey(s, "backspace")
    expect(s.decimalPressed).toBe(false)
  })

  it("parses formatted input integers", () => {
    expect(billStateToCents(billStateFromFormattedInput("50"))).toBe(5000)
    expect(billStateToCents(billStateFromFormattedInput("050"))).toBe(5000)
  })

  it("parses comma and dot decimals", () => {
    expect(billStateToAmount(billStateFromFormattedInput("3,5"))).toBe(3.5)
    expect(billStateToAmount(billStateFromFormattedInput("3.50"))).toBe(3.5)
    expect(billStateToAmount(billStateFromFormattedInput("0,05"))).toBe(0.05)
  })

  it("parses leading decimal as zero int", () => {
    expect(billStateToAmount(billStateFromFormattedInput(",5"))).toBe(0.5)
    expect(billStateToAmount(billStateFromFormattedInput(".5"))).toBe(0.5)
  })

  it("clamps pasted overflow via formatted input", () => {
    const s = billStateFromFormattedInput("99999,99")
    expect(billStateToAmount(s)).toBeLessThanOrEqual(MAX_BILL_AMOUNT)
    expect(billStateToCents(s)).toBeLessThanOrEqual(999999)
  })

  it("parses max amount string exactly", () => {
    expect(billStateToAmount(billStateFromFormattedInput("9999,99"))).toBe(
      MAX_BILL_AMOUNT,
    )
  })

  it("formatAmountDisplay uses NBSP thousands and comma decimal", () => {
    let s = initialBillNumpadState()
    for (const d of "1000") s = applyNumpadKey(s, d as NumpadKey)
    expect(formatAmountDisplay(s)).toBe("1\u00A0000")
    s = initialBillNumpadState()
    for (const d of "1234") s = applyNumpadKey(s, d as NumpadKey)
    expect(formatAmountDisplay(s)).toBe("1\u00A0234")
    s = initialBillNumpadState()
    s = applyNumpadKey(s, "5")
    s = applyNumpadKey(s, "0")
    s = applyNumpadKey(s, ".")
    expect(formatAmountDisplay(s)).toBe("50,")
    s = applyNumpadKey(s, "3")
    expect(formatAmountDisplay(s)).toBe("50,3")
  })

  it("parses input with NBSP thousands", () => {
    expect(billStateToCents(billStateFromFormattedInput("1\u00A0000"))).toBe(100000)
  })

  it("formatBillEditableDisplay omits cents until decimal", () => {
    let s = initialBillNumpadState()
    s = applyNumpadKey(s, "5")
    s = applyNumpadKey(s, "0")
    expect(formatBillEditableDisplay(s)).toBe("50")
    s = applyNumpadKey(s, ".")
    expect(formatBillEditableDisplay(s)).toBe("50,")
    s = applyNumpadKey(s, "5")
    expect(formatBillEditableDisplay(s)).toBe("50,5")
    s = applyNumpadKey(s, "5")
    expect(formatBillEditableDisplay(s)).toBe("50,55")
  })

  it("billNumpadStateFromCents restores typed value", () => {
    expect(billStateToCents(billNumpadStateFromCents(0))).toBe(0)
    expect(billStateToCents(billNumpadStateFromCents(1200))).toBe(1200)
    expect(billStateToAmount(billNumpadStateFromCents(12345))).toBe(123.45)
  })
})
