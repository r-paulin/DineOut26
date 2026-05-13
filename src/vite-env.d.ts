/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  /** Set to `"1"` in dev to enable `createLogger` console output. */
  readonly VITE_DEBUG_LOGS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
