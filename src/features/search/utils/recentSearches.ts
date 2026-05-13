const STORAGE_KEY = "dineout.recentSearches"
const MAX = 4

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is string => typeof x === "string")
  } catch {
    return []
  }
}

function write(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Ignore storage write failures (private mode, quota, blocked storage).
  }
}

export function getRecentSearches(): string[] {
  return read()
}

export function addRecentSearch(query: string) {
  const q = query.trim()
  if (!q) return
  const prev = read().filter((x) => x.toLowerCase() !== q.toLowerCase())
  write([q, ...prev].slice(0, MAX))
}
