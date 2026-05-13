import { List, Typography } from "@bolteu/kalep-react"
import Time from "@bolteu/kalep-react-icons/dist/Time"
import { POPULAR_CATEGORIES } from "@/features/search/data/searchCategories"
import type { SearchFullscreenProps } from "@/features/search/search.types"
import { useSearchFullscreen } from "@/features/search/hooks/useSearchFullscreen"
import { FilterChipRow } from "./FilterChipRow"
import { SearchInput } from "./SearchInput"
import { SearchResultsStatic } from "./SearchResultsStatic"

/**
 * Full-screen search overlay: debounced static results, recent searches, and
 * popular categories. Filter chips share discover filter state.
 */
export function SearchFullscreen(props: SearchFullscreenProps) {
  const {
    query,
    setQuery,
    contentPhase,
    showBrowse,
    recents,
    handleCancel,
    pickRecent,
    pickCategory,
    submitQuery,
  } = useSearchFullscreen({ onClose: props.onClose })

  const {
    surface,
    filterState,
    getChipLabel,
    isChipActive,
    isChipLocked,
    openNowTrailing,
    openSheet,
    toggleOpenNowToday,
    clearOpenNowFilter,
    setOpenAtTime,
    onRestaurantPress,
  } = props

  return (
    <div
      className="fixed left-0 right-0 bottom-0 top-[var(--modal-top-gap)] z-[120] flex flex-col w-full max-w-[var(--shell-width)] mx-auto bg-layer-floor-1 box-border"
      style={{ minHeight: "calc(var(--app-h) - var(--modal-top-gap))" }}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="flex-none px-6 pt-6 bg-layer-floor-1 w-full min-w-0">
        <SearchInput
          variant="fullscreen"
          value={query}
          onChange={setQuery}
          loading={false}
          autoFocus
          onCancel={handleCancel}
          onSubmit={submitQuery}
        />
      </div>
      <div className="flex-none flex flex-row items-center pt-2 pb-3 px-6 bg-layer-floor-1 w-full min-w-0 overflow-x-auto overflow-y-visible touch-pan-x [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden [overscroll-behavior-x:contain]">
        <FilterChipRow
          surface={surface}
          filterState={filterState}
          getChipLabel={getChipLabel}
          isChipActive={isChipActive}
          isChipLocked={isChipLocked}
          openNowTrailing={openNowTrailing}
          openSheet={openSheet}
          toggleOpenNowToday={toggleOpenNowToday}
          clearOpenNowFilter={clearOpenNowFilter}
          setOpenAtTime={setOpenAtTime}
        />
        <div
          className="shrink-0 w-5 self-stretch pointer-events-none"
          aria-hidden
        />
      </div>
      <div
        className="flex-1 min-h-0 overflow-y-auto px-6 bg-layer-floor-1"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        {showBrowse && recents.length > 0 ? (
          <section className="mb-5 pt-1" aria-label="Recent searches">
            <Typography
              as="h2"
              variant="heading-xs-accent"
              paddingBottom={3}
            >
              Recent searches
            </Typography>
            <List.Root>
              {recents.map((q) => (
                <List.Item
                  key={q}
                  paddingStart={0}
                  paddingEnd={0}
                  separator
                  primary={q}
                  onClick={() => pickRecent(q)}
                  renderStartSlot={() => <Time size="lg" />}
                />
              ))}
            </List.Root>
          </section>
        ) : null}
        {contentPhase === "typingSkeleton" ? (
          <section
            className="flex flex-col gap-0 w-full mb-2"
            aria-label="Loading suggestions"
            aria-busy="true"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-full min-h-[3.25rem] py-3 border-b border-separator last:border-b-0 flex items-center"
              >
                <div className="relative w-full h-4 rounded-lg bg-neutral-secondary overflow-hidden after:content-[''] after:absolute after:inset-0 after:[animation:shimmer_1.2s_ease-in-out_infinite] after:[background:linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.55)_45%,transparent_90%)]" />
              </div>
            ))}
          </section>
        ) : null}
        {contentPhase === "results" ? (
          <div className="w-full min-w-0 pt-3">
            <SearchResultsStatic
              onRestaurantPress={onRestaurantPress}
            />
          </div>
        ) : null}
        {showBrowse ? (
          <section aria-label="Popular categories">
            <Typography
              as="h2"
              variant="heading-xs-accent"
              paddingBottom={3}
            >
              Popular categories
            </Typography>
            <List.Root className="mb-6">
              {POPULAR_CATEGORIES.map((c) => (
                <List.Item
                  key={c.label}
                  paddingStart={0}
                  paddingEnd={0}
                  separator
                  primary={c.label}
                  onClick={() => pickCategory(c.label)}
                  renderStartSlot={() => (
                    <span className="text-[1.375rem] leading-none" aria-hidden>
                      {c.emoji}
                    </span>
                  )}
                />
              ))}
            </List.Root>
          </section>
        ) : null}
      </div>
    </div>
  )
}
