/** User-facing people count for claim modal picker rows. */
export function formatPeopleCountLabel(count: number): string {
  return count === 1 ? "1 person" : `${count} people`
}
