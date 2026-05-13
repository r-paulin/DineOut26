function debugLogsEnabled(): boolean {
  return (
    import.meta.env.DEV && import.meta.env.VITE_DEBUG_LOGS === "1"
  )
}

/**
 * Scoped debug logger. Emits only when `import.meta.env.DEV` and
 * `VITE_DEBUG_LOGS=1` (keeps the default dev console quiet).
 */
export function createLogger(scope: string) {
  const prefix = `[DineOut:${scope}]`
  return {
    debug(...args: unknown[]) {
      if (debugLogsEnabled()) {
        console.debug(prefix, ...args)
      }
    },
    warn(...args: unknown[]) {
      console.warn(prefix, ...args)
    },
  }
}
