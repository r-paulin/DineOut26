/**
 * Stable URLs for files under `public/images/…`.
 * Encode the filename segment so spaces and Unicode survive in `src` / CSS.
 * Restaurant **logos** are PNGs in `public/images/restaurants/` (see `restaurantLogos.ts`);
 * venue photos use separate raster files (e.g. `.jpg`).
 */
export function restaurantImageUrl(filename: string): string {
  return `/images/restaurants/${encodeURIComponent(filename)}`
}

export function modalImageUrl(filename: string): string {
  return `/images/modal-img/${encodeURIComponent(filename)}`
}
