/**
 * Bill amount entry rules (PRD §3). Internal amounts use minor units (cents).
 */

export const MAX_BILL_AMOUNT = 9999.99
export const DECIMAL_PLACES = 2
const MAX_CENTS = Math.round(MAX_BILL_AMOUNT * 100)

const NBSP = "\u00A0"

/** Thousands grouping for integer digit string (no separators inside). */
export function formatIntThousands(digits: string): string {
  const n = digits.replace(/\D/g, "")
  if (n === "") return ""
  const parts: string[] = []
  for (let i = n.length; i > 0; i -= 3) {
    parts.unshift(n.slice(Math.max(0, i - 3), i))
  }
  return parts.join(NBSP)
}

/**
 * Display string for the amount field (no €). Uses `,` as decimal separator and
 * NBSP as thousands separator (EU).
 */
export function formatAmountDisplay(state: BillNumpadState): string {
  if (!state.decimalPressed) {
    return formatIntThousands(state.intPart)
  }
  const intDigits = state.intPart === "" ? "0" : state.intPart
  const intFmt = formatIntThousands(intDigits)
  return `${intFmt},${state.fracPart}`
}

export type NumpadKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "."
  | "backspace"

/** Incremental state while typing on the numpad (decimal separator is `.` internally). */
export interface BillNumpadState {
  /** Integer part digits (no leading zeros except lone `0`). */
  intPart: string
  /** Fractional digits (0–2) after user pressed decimal. */
  fracPart: string
  /** User has pressed the decimal key at least once. */
  decimalPressed: boolean
}

export const initialBillNumpadState = (): BillNumpadState => ({
  intPart: "",
  fracPart: "",
  decimalPressed: false,
})

function intPartToNumber(intPart: string): number {
  if (intPart === "") return 0
  return Number.parseInt(intPart, 10)
}

/** Append a digit to the integer part; enforces no leading zeros (except `0` then decimal). */
export function appendIntDigit(intPart: string, digit: string): string {
  if (digit.length !== 1 || digit < "0" || digit > "9") return intPart
  if (intPart === "") return digit === "0" ? "0" : digit
  if (intPart === "0") return digit === "0" ? "0" : digit
  return intPart + digit
}

/** Current value in cents from numpad state. */
export function billStateToCents(state: BillNumpadState): number {
  const intVal = intPartToNumber(state.intPart === "" ? "0" : state.intPart)
  const frac = state.fracPart.padEnd(DECIMAL_PLACES, "0").slice(0, DECIMAL_PLACES)
  const fracNum = Number.parseInt(frac || "0", 10)
  return intVal * 100 + fracNum
}

/** True when Continue should be enabled (strictly positive, within max). */
export function isBillAmountValidForContinue(state: BillNumpadState): boolean {
  const cents = billStateToCents(state)
  return cents > 0 && cents <= MAX_CENTS
}

/** Amount in major units (e.g. EUR) for store / calculations. */
export function billStateToAmount(state: BillNumpadState): number {
  return billStateToCents(state) / 100
}

function centsWithinMax(state: BillNumpadState): boolean {
  return billStateToCents(state) <= MAX_CENTS
}

/**
 * Apply one numpad key. Invalid transitions leave state unchanged (returns shallow copy).
 */
export function applyNumpadKey(
  state: BillNumpadState,
  key: NumpadKey,
): BillNumpadState {
  if (key === "backspace") {
    if (state.decimalPressed && state.fracPart.length > 0) {
      return {
        ...state,
        fracPart: state.fracPart.slice(0, -1),
      }
    }
    if (state.decimalPressed && state.fracPart.length === 0) {
      return {
        ...state,
        decimalPressed: false,
      }
    }
    if (state.intPart.length > 0) {
      return {
        ...state,
        intPart: state.intPart.slice(0, -1),
      }
    }
    return initialBillNumpadState()
  }

  if (key === ".") {
    if (state.decimalPressed) return { ...state }
    const intPart = state.intPart === "" ? "0" : state.intPart
    return { ...state, intPart, decimalPressed: true, fracPart: "" }
  }

  const digit = key
  if (state.decimalPressed) {
    if (state.fracPart.length >= DECIMAL_PLACES) return { ...state }
    const next: BillNumpadState = {
      ...state,
      fracPart: state.fracPart + digit,
    }
    return centsWithinMax(next) ? next : { ...state }
  }

  const nextInt = appendIntDigit(state.intPart, digit)
  const next: BillNumpadState = {
    ...state,
    intPart: nextInt,
  }
  return centsWithinMax(next) ? next : { ...state }
}

/**
 * Parses a free-typed amount string (comma or dot decimal) into numpad state.
 * Used for native mobile keyboards. Values above max are clamped.
 */
export function billStateFromFormattedInput(raw: string): BillNumpadState {
  const t = raw
    .trim()
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(/[^\d.,]/g, "")
  if (t === "") return initialBillNumpadState()

  let sep = -1
  for (let i = 0; i < t.length; i++) {
    if (t[i] === "," || t[i] === ".") {
      sep = i
      break
    }
  }

  let candidate: BillNumpadState
  if (sep < 0) {
    const digitsOnly = t.replace(/\D/g, "")
    candidate = intDigitsToState(digitsOnly)
  } else {
    const intDigits = t.slice(0, sep).replace(/\D/g, "")
    const fracDigits = t
      .slice(sep + 1)
      .replace(/\D/g, "")
      .slice(0, DECIMAL_PLACES)
    const intPart = normalizeIntDigitsForDecimal(intDigits)
    candidate = {
      intPart,
      fracPart: fracDigits,
      decimalPressed: true,
    }
  }

  return clampBillStateToMax(candidate)
}

function intDigitsToState(digitsOnly: string): BillNumpadState {
  if (digitsOnly === "") return initialBillNumpadState()
  let intPart = ""
  for (const ch of digitsOnly) {
    if (ch < "0" || ch > "9") continue
    intPart = appendIntDigit(intPart, ch)
  }
  return { intPart, fracPart: "", decimalPressed: false }
}

function normalizeIntDigitsForDecimal(intDigits: string): string {
  if (intDigits === "") return "0"
  const stripped = intDigits.replace(/^0+/, "")
  return stripped === "" ? "0" : stripped
}

function clampBillStateToMax(state: BillNumpadState): BillNumpadState {
  let s = state
  let guard = 0
  while (billStateToCents(s) > MAX_CENTS && guard < 32) {
    const next = applyNumpadKey(s, "backspace")
    if (next === s) break
    s = next
    guard += 1
  }
  return s
}

/** Maps physical keyboard keys to numpad keys (desktop bill entry). */
export function numpadKeyFromKeyboardEvent(e: {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
}): NumpadKey | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null
  if (e.key >= "0" && e.key <= "9") return e.key as NumpadKey
  if (e.key === "." || e.key === ",") return "."
  if (e.key === "Backspace") return "backspace"
  return null
}

/**
 * Editable / live display: whole euros with NBSP thousands until decimal, then `,` + cents.
 */
export function formatBillEditableDisplay(state: BillNumpadState): string {
  return formatAmountDisplay(state)
}

/** Format for legacy call sites; `text` matches {@link formatBillEditableDisplay}. */
export function formatBillDisplayEur(
  state: BillNumpadState,
  options?: { dimWhenZero?: boolean },
): { text: string; dim: boolean } {
  const text = formatBillEditableDisplay(state)
  const dim =
    Boolean(options?.dimWhenZero) && billStateToCents(state) === 0
  return { text, dim }
}

/** Rebuild numpad state from a stored amount in cents (e.g. reopening custom tip). */
export function billNumpadStateFromCents(initialCents: number): BillNumpadState {
  let s = initialBillNumpadState()
  const euros = initialCents / 100
  const whole = Math.floor(euros + 1e-9)
  const frac = Math.round((euros - whole) * 100)
  const wholeStr = String(whole)
  for (const ch of wholeStr) {
    s = applyNumpadKey(s, ch as NumpadKey)
  }
  if (frac > 0) {
    s = applyNumpadKey(s, ".")
    const fracStr = String(frac).padStart(2, "0").replace(/0+$/, "")
    for (const ch of fracStr) {
      s = applyNumpadKey(s, ch as NumpadKey)
    }
  }
  return s
}
