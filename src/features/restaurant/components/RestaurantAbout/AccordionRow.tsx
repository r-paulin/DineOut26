import { Typography } from "@bolteu/kalep-react"
import ChevronDown from "@bolteu/kalep-react-icons/dist/ChevronDown"
import ChevronUp from "@bolteu/kalep-react-icons/dist/ChevronUp"

/** Split merged tag lines (`a · b`, `a, b`) into discrete list entries for the 2-col layout. */
function expandBulletItems(items: readonly string[]): string[] {
  const out: string[] = []
  for (const raw of items) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const parts = trimmed.split(/\s*(?:·|,)\s*/).map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) {
      out.push(...parts)
    }
  }
  return out
}

export interface AccordionRowProps {
  title: string
  expanded: boolean
  onToggle: () => void
  variant?: "bullets" | "keyValue"
  bulletItems?: readonly string[]
  keyValueRows?: readonly { label: string; value: string }[]
}

/**
 * Exclusive accordion: inset horizontal rules; collapsed header has bottom rule,
 * expanded header has no bottom rule — separator only after the panel (Figma).
 */
export function AccordionRow({
  title,
  expanded,
  onToggle,
  variant = "bullets",
  bulletItems = [],
  keyValueRows = [],
}: AccordionRowProps) {
  const normalizedBullets =
    variant === "bullets" ? expandBulletItems(bulletItems) : []

  return (
    <div className="flex w-full flex-col bg-layer-floor-1">
      <div className="px-6">
        <button
          type="button"
          data-no-press
          className={`flex h-14 w-full shrink-0 cursor-pointer items-center justify-between border-0 border-solid border-separator bg-transparent text-left ${
            expanded ? "border-b-0" : "border-b"
          }`}
          aria-expanded={expanded}
          onClick={onToggle}
        >
          <Typography variant="body-m-accent" color="primary" as="span">
            {title}
          </Typography>
          <span className="flex shrink-0 text-action-primary" aria-hidden>
            {expanded ? (
              <ChevronUp size="lg" />
            ) : (
              <ChevronDown size="lg" />
            )}
          </span>
        </button>
      </div>

      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="px-6 pb-4 pt-2">
            {variant === "bullets" ? (
              <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-2.5 p-0">
                {normalizedBullets.map((item, i) => (
                  <li
                    key={`${title}-${i}-${item}`}
                    className="grid min-w-0 grid-cols-[auto_1fr] items-baseline gap-x-2 gap-y-0"
                  >
                    <span
                      className="shrink-0 text-[0.875rem] leading-[1.2] text-primary"
                      aria-hidden
                    >
                      •
                    </span>
                    <span className="min-w-0 leading-[1.2]">
                      <Typography
                        variant="body-s-regular"
                        color="primary"
                        as="span"
                        inline
                      >
                        {item}
                      </Typography>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-0">
                {keyValueRows.map((row, i) => (
                  <div
                    key={`${title}-kv-${i}`}
                    className="flex w-full flex-col gap-0 border-0 border-b border-solid border-separator py-3 last:border-b-0"
                  >
                    <Typography
                      variant="body-s-regular"
                      color="secondary"
                      as="span"
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      variant="body-m-regular"
                      color="primary"
                      as="span"
                    >
                      {row.value}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded ? (
        <div
          className="mx-6 border-0 border-b border-solid border-separator"
          aria-hidden
        />
      ) : null}
    </div>
  )
}
