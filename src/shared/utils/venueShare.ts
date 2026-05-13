/** Absolute `https` URL for Web Share `url`, or empty string when none is safe to share. */
export function venueShareUrl(website: string): string {
  try {
    const w = website.trim()
    if (!w) return ""
    const u = new URL(w.startsWith("http") ? w : `https://${w}`)
    if (u.protocol !== "http:" && u.protocol !== "https:") return ""
    return u.href
  } catch {
    return ""
  }
}

function shareTextSnippet(description: string, maxLen = 200): string {
  const t = description.trim().replace(/\s+/g, " ")
  if (t.length <= maxLen) return t
  return `${t.slice(0, maxLen - 1)}…`
}

export function buildVenueSharePayload(input: {
  name: string
  description: string
  website: string
}): ShareData {
  const url = venueShareUrl(input.website)
  const text = shareTextSnippet(input.description)
  return {
    title: input.name,
    ...(text ? { text } : {}),
    ...(url ? { url } : {}),
  }
}
