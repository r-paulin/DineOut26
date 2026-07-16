import { useSearchInputField } from "@/features/search/hooks/useSearchInputField"
import Search from "@bolteu/kalep-react-icons/dist/Search"
import Cross from "@bolteu/kalep-react-icons/dist/Cross"

export type SearchInputVariant = "fullscreen"

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  variant: SearchInputVariant
  loading?: boolean
  skeleton?: boolean
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
  onSubmit?: () => void
}

function preventBlurMouseDown(e: React.MouseEvent) {
  e.preventDefault()
}

/** Inline loading spinner (no Kalep equivalent for inline-search use). */
function SearchSpinner({ className }: { className?: string }) {
  const sw = 2
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeDasharray="42"
        strokeDashoffset="12"
        opacity="0.25"
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SearchInput({
  value,
  onChange,
  loading = false,
  skeleton = false,
  placeholder = "Restaurants, cafes, bars...",
  autoFocus,
  onCancel,
  onSubmit,
}: SearchInputProps) {
  const { inputRef, focused, setFocused } = useSearchInputField()

  const filled = value.length > 0
  const activePill = focused || filled
  const showCancel = !skeleton

  const pillSurface = skeleton
    ? "bg-neutral-secondary border-transparent overflow-hidden relative"
    : loading || activePill
      ? "bg-layer-floor-1 border-action-primary"
      : "bg-neutral-secondary border-transparent"

  const clearVisible = !skeleton && !loading && filled

  return (
    <div className="flex items-center gap-3 min-h-12 w-full">
      <div
        className={`flex-1 min-w-0 w-full h-12 flex items-center gap-[0.625rem] px-[0.875rem] pe-3 rounded-[var(--radius-search-field)] border transition-[background-color,border-color,box-shadow] duration-150 ${pillSurface}`}
      >
        {skeleton ? (
          <div className="skeleton-bone absolute inset-0 rounded-[inherit]" aria-hidden />
        ) : (
          <>
            <Search size="lg" className="shrink-0 text-primary" />
            <input
              ref={inputRef}
              className="ffeature flex-1 min-w-0 h-full border-none bg-transparent text-base leading-6 -tracking-[0.006875rem] text-primary outline-none placeholder:text-tertiary"
              type="text"
              inputMode="search"
              value={value}
              autoFocus={autoFocus}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onSubmit?.()
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              enterKeyHint="search"
              aria-label={placeholder}
            />
            {loading ? (
              <SearchSpinner className="text-action-primary [animation:spin_0.7s_linear_infinite]" />
            ) : clearVisible ? (
              <button
                type="button"
                className="shrink-0 flex items-center justify-center w-8 h-8 m-0 p-0 border-none rounded-full bg-transparent text-secondary cursor-pointer hover:bg-[rgba(0,45,30,0.06)]"
                aria-label="Clear"
                onMouseDown={preventBlurMouseDown}
                onClick={() => onChange("")}
              >
                <Cross size="lg" />
              </button>
            ) : null}
          </>
        )}
      </div>
      {showCancel ? (
        <button
          type="button"
          className="ffeature shrink-0 px-1 py-2 border-none bg-transparent text-sm leading-5 -tracking-[0.00375rem] text-primary cursor-pointer hover:opacity-85"
          onMouseDown={preventBlurMouseDown}
          onClick={() => {
            inputRef.current?.blur()
            onCancel?.()
          }}
        >
          Cancel
        </button>
      ) : null}
    </div>
  )
}
