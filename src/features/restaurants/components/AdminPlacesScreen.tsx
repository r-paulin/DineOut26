/**
 * Prototype admin: edit merged restaurant catalog; persists to localStorage via
 * {@link useRestaurantCatalogStore}. No authentication — see bottom-sheet disclaimer.
 */

import { Button, Typography } from "@bolteu/kalep-react"
import { useCallback, useMemo, useState } from "react"
import type { RestaurantSlug } from "@/features/offers/data/restaurantOffers.types"
import {
  buildEntryFromForm,
  type BuildEntryFromFormInput,
} from "@/features/restaurants/catalogValidation"
import {
  getMergedRestaurantCatalogEntry,
  getRestaurantCatalogOrder,
} from "@/features/restaurants/restaurantCatalogRuntime"
import { useRestaurantCatalogStore } from "@/features/restaurants/restaurantCatalogStore"
import type { RestaurantCatalogEntry } from "@/features/restaurants/restaurants.catalog"
import { useSnackbar } from "@/shared/snackbar"

export interface AdminPlacesScreenProps {
  onClose: () => void
}

function entryToFormInput(e: RestaurantCatalogEntry): BuildEntryFromFormInput {
  return {
    slug: e.slug,
    name: e.name,
    displayPrice: e.displayPrice,
    area: e.area,
    rating: e.rating,
    reviewSuffix: e.reviewSuffix,
    tags: e.tags,
    tagDescription: e.tagDescription,
    phone: e.phone,
    address: e.address,
    website: e.website,
    imagesPrimary: e.images.primary,
    imagesSideTop: e.images.sideTop,
    imagesSideBottom: e.images.sideBottom,
    logoFilenamesText: e.logoFilenames.join("\n"),
    whatWeServeText: e.whatWeServe.join("\n"),
    amenitiesText: e.amenities.join("\n"),
    timedOffersJson: JSON.stringify(e.timedOffers, null, 2),
    primaryGrad: Boolean(e.primaryGrad),
  }
}

function LabeledField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-1 min-w-0">
      <Typography variant="body-s-regular" color="secondary" as="span">
        {label}
      </Typography>
      {children}
    </label>
  )
}

export function AdminPlacesScreen({ onClose }: AdminPlacesScreenProps) {
  const snackbar = useSnackbar()
  const persistRestaurant = useRestaurantCatalogStore((s) => s.persistRestaurant)
  const resetSlug = useRestaurantCatalogStore((s) => s.resetSlug)
  const resetAll = useRestaurantCatalogStore((s) => s.resetAll)
  const persisted = useRestaurantCatalogStore((s) => s.persistedBySlug)

  const order = useMemo(() => [...getRestaurantCatalogOrder()], [])
  const [selectedSlug, setSelectedSlug] = useState<RestaurantSlug | null>(null)
  const [form, setForm] = useState<BuildEntryFromFormInput | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const loadSlug = useCallback((slug: RestaurantSlug) => {
    const merged = getMergedRestaurantCatalogEntry(slug)
    if (!merged) return
    setForm(entryToFormInput(merged))
    setParseError(null)
    setSelectedSlug(slug)
  }, [])

  const handleSave = useCallback(() => {
    if (!form) return
    const built = buildEntryFromForm(form)
    if (!built.ok) {
      setParseError(built.error)
      snackbar.add({
        title: "Could not save",
        description: built.error,
        timeout: 5000,
      })
      return
    }
    setParseError(null)
    persistRestaurant(form.slug, built.entry)
    snackbar.add({
      title: "Saved",
      description: `${built.entry.name} updated for this browser.`,
      timeout: 4000,
    })
  }, [form, persistRestaurant, snackbar])

  const handleResetVenue = useCallback(() => {
    if (!form) return
    resetSlug(form.slug)
    loadSlug(form.slug)
    snackbar.add({
      title: "Reset venue",
      description: "Restored defaults from app bundle for this place.",
      timeout: 4000,
    })
  }, [form, loadSlug, resetSlug, snackbar])

  const handleResetAll = useCallback(() => {
    resetAll()
    setSelectedSlug(null)
    setForm(null)
    snackbar.add({
      title: "Reset all",
      description: "Cleared admin overrides in this browser.",
      timeout: 4000,
    })
  }, [resetAll, snackbar])

  const update = useCallback(
    (patch: Partial<BuildEntryFromFormInput>) => {
      setForm((f) => (f ? { ...f, ...patch } : f))
    },
    [],
  )

  if (!selectedSlug || !form) {
    return (
      <div
        className="fixed inset-0 z-[120] flex min-h-0 w-full max-w-[var(--shell-width)] mx-auto flex-col bg-layer-floor-1 box-border"
        role="dialog"
        aria-modal="true"
        aria-label="Edit places admin"
      >
        <header className="flex-none flex items-center justify-between gap-3 px-6 pt-6 pb-3 border-b border-[var(--color-border-separator)]">
          <Typography variant="heading-m-accent" as="h1" color="primary">
            Edit places
          </Typography>
          <button
            type="button"
            className="shrink-0 px-2 py-2 border-none bg-transparent text-sm text-primary cursor-pointer hover:opacity-85"
            onClick={onClose}
          >
            Close
          </button>
        </header>
        <div
          className="flex-1 min-h-0 overflow-y-auto px-6 py-4"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
          }}
        >
          <div className="mb-4">
            <Typography variant="body-m-regular" color="secondary" as="p">
              Tap a venue to edit. Changes apply after Save and persist in
              localStorage for this device only.
            </Typography>
          </div>
          <ul className="flex flex-col gap-2 p-0 m-0 list-none">
            {order.map((slug) => {
              const e = getMergedRestaurantCatalogEntry(slug)
              const dirty = Boolean(persisted[slug])
              return (
                <li key={slug}>
                  <button
                    type="button"
                    className="w-full text-left rounded-[var(--radius-md)] border border-[var(--color-border-separator)] bg-neutral-secondary px-4 py-3 hover:opacity-90 cursor-pointer"
                    onClick={() => loadSlug(slug)}
                  >
                    <Typography variant="body-m-regular" color="primary" as="span">
                      {e?.name ?? slug}
                    </Typography>
                    {dirty ?
                      <div className="block mt-0.5">
                        <Typography
                          variant="body-s-regular"
                          color="secondary"
                          as="span"
                        >
                          Custom data (overrides defaults)
                        </Typography>
                      </div>
                    : null}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-6 pt-4 border-t border-[var(--color-border-separator)]">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleResetAll}
            >
              Reset all overrides
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex min-h-0 w-full max-w-[var(--shell-width)] mx-auto flex-col bg-layer-floor-1 box-border"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${form.name}`}
    >
      <header className="flex-none flex items-center gap-2 px-4 pt-6 pb-3 border-b border-[var(--color-border-separator)]">
        <button
          type="button"
          className="shrink-0 px-2 py-2 border-none bg-transparent text-sm text-primary cursor-pointer"
          onClick={() => {
            setSelectedSlug(null)
            setForm(null)
          }}
        >
          Back
        </button>
        <div className="flex-1 truncate min-w-0">
          <Typography variant="heading-s-accent" as="h1" color="primary">
            {form.name}
          </Typography>
        </div>
        <button
          type="button"
          className="shrink-0 px-2 py-2 border-none bg-transparent text-sm text-primary cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </header>
      <div
        className="flex-1 min-h-0 overflow-y-auto px-6 py-4 flex flex-col gap-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        }}
      >
        {parseError ?
          <div className="text-[#b00020]">
            <Typography variant="body-s-regular" color="primary" as="p">
              {parseError}
            </Typography>
          </div>
        : null}

        <LabeledField label="Name">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm min-w-0"
            value={form.name}
            onChange={(ev) => update({ name: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Display price (e.g. 35–55 €)">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.displayPrice}
            onChange={(ev) => update({ displayPrice: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Area">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.area}
            onChange={(ev) => update({ area: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Rating (string)">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.rating}
            onChange={(ev) => update({ rating: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Review suffix (e.g. (200+))">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.reviewSuffix}
            onChange={(ev) => update({ reviewSuffix: ev.target.value })}
          />
        </LabeledField>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.primaryGrad}
            onChange={(ev) => update({ primaryGrad: ev.target.checked })}
          />
          <Typography variant="body-m-regular" color="primary" as="span">
            Primary card gradient (search)
          </Typography>
        </label>
        <LabeledField label="Tags (short line)">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.tags}
            onChange={(ev) => update({ tags: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Tag description">
          <textarea
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm min-h-[4rem] resize-y"
            value={form.tagDescription}
            onChange={(ev) => update({ tagDescription: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Phone">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.phone}
            onChange={(ev) => update({ phone: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Address">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.address}
            onChange={(ev) => update({ address: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Website URL">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm"
            value={form.website}
            onChange={(ev) => update({ website: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Image filename — primary">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary font-mono text-xs"
            value={form.imagesPrimary}
            onChange={(ev) => update({ imagesPrimary: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Image filename — side top">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary font-mono text-xs"
            value={form.imagesSideTop}
            onChange={(ev) => update({ imagesSideTop: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Image filename — side bottom">
          <input
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary font-mono text-xs"
            value={form.imagesSideBottom}
            onChange={(ev) => update({ imagesSideBottom: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Logo filenames (one per line)">
          <textarea
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary font-mono text-xs min-h-[4rem] resize-y"
            value={form.logoFilenamesText}
            onChange={(ev) => update({ logoFilenamesText: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="What we serve (one per line)">
          <textarea
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm min-h-[6rem] resize-y"
            value={form.whatWeServeText}
            onChange={(ev) => update({ whatWeServeText: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Amenities (one per line)">
          <textarea
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary text-sm min-h-[6rem] resize-y"
            value={form.amenitiesText}
            onChange={(ev) => update({ amenitiesText: ev.target.value })}
          />
        </LabeledField>
        <LabeledField label="Timed offers (JSON array)">
          <textarea
            className="rounded-md border border-[var(--color-border-separator)] bg-layer-floor-1 px-3 py-2 text-primary font-mono text-xs min-h-[10rem] resize-y w-full"
            spellCheck={false}
            value={form.timedOffersJson}
            onChange={(ev) => update({ timedOffersJson: ev.target.value })}
          />
        </LabeledField>

        <div className="flex flex-col gap-2 pt-2">
          <Button type="button" variant="primary" size="lg" fullWidth onClick={handleSave}>
            Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleResetVenue}
          >
            Reset this venue to defaults
          </Button>
        </div>
      </div>
    </div>
  )
}
