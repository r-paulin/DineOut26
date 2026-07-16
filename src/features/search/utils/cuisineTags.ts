import { CUISINE_OPTIONS } from "@/features/search/data/filterOptions"

/** Split a catalog / card tag line (`·` or comma). */
export function parseTagLine(raw: string): string[] {
  return raw
    .split(/\s*[·,]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Keep only labels that belong to {@link CUISINE_OPTIONS}.
 * Matches full option labels (e.g. `Mediterranean`) or a `/`-part
 * (e.g. tag `Sushi` → `Japanese / Sushi`).
 */
export function filterTagsToCuisineLabels(tags: readonly string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  for (const tag of tags) {
    const t = tag.trim().toLowerCase()
    if (!t) continue

    const exact = CUISINE_OPTIONS.find((o) => o.label.toLowerCase() === t)
    if (exact && !seen.has(exact.label)) {
      seen.add(exact.label)
      out.push(exact.label)
      continue
    }

    for (const opt of CUISINE_OPTIONS) {
      if (seen.has(opt.label)) continue
      const needles = [
        opt.label.toLowerCase(),
        ...opt.label.split("/").map((p) => p.trim().toLowerCase()),
      ].filter(Boolean)
      if (needles.some((n) => t === n || t.includes(n))) {
        seen.add(opt.label)
        out.push(opt.label)
        break
      }
    }
  }

  return out
}
