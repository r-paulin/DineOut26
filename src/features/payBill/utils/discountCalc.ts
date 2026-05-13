/**
 * Compound discount on subtotal (receipt + tip): S × (1 − d1/100) × (1 − d2/100).
 */

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function subtotalWithTip(
  receiptTotal: number,
  tip: number | null,
): number {
  return round2(receiptTotal + (tip ?? 0))
}

/** Final amount after two sequential percentage discounts. */
export function finalAmountCompound(
  receiptTotal: number,
  tip: number | null,
  discountPercent: number,
  discountAddPercent: number,
): number {
  const S = subtotalWithTip(receiptTotal, tip)
  const f1 = 1 - discountPercent / 100
  const f2 = 1 - discountAddPercent / 100
  return round2(S * f1 * f2)
}

/** Total discount in currency (subtotal minus final). */
export function discountAmountCompound(
  receiptTotal: number,
  tip: number | null,
  discountPercent: number,
  discountAddPercent: number,
): number {
  const S = subtotalWithTip(receiptTotal, tip)
  const final = finalAmountCompound(
    receiptTotal,
    tip,
    discountPercent,
    discountAddPercent,
  )
  return round2(S - final)
}

/**
 * Subtotal after the first percentage only: S × (1 − d1/100).
 * Used to split “Claimed offer discount” vs “DineOut benefit” on the pay receipt.
 */
export function subtotalAfterFirstDiscount(
  receiptTotal: number,
  tip: number | null,
  discountPercent: number,
): number {
  const S = subtotalWithTip(receiptTotal, tip)
  const f1 = 1 - discountPercent / 100
  return round2(S * f1)
}

/** EUR removed by the first discount step (S − S×(1−d1/100)). */
export function discountFirstEur(
  receiptTotal: number,
  tip: number | null,
  discountPercent: number,
): number {
  const S = subtotalWithTip(receiptTotal, tip)
  const afterFirst = subtotalAfterFirstDiscount(
    receiptTotal,
    tip,
    discountPercent,
  )
  return round2(S - afterFirst)
}

/** EUR removed by the second step on the post–first-discount amount. */
export function discountSecondEur(
  receiptTotal: number,
  tip: number | null,
  discountPercent: number,
  discountAddPercent: number,
): number {
  const afterFirst = subtotalAfterFirstDiscount(
    receiptTotal,
    tip,
    discountPercent,
  )
  const final = finalAmountCompound(
    receiptTotal,
    tip,
    discountPercent,
    discountAddPercent,
  )
  return round2(afterFirst - final)
}
