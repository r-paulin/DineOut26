function createStorageMock(store: Record<string, string>) {
  return {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => {
      store[k] = v
    },
    removeItem: (k: string) => {
      delete store[k]
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k]
    },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() {
      return Object.keys(store).length
    },
  }
}

const localMem: Record<string, string> = {}
Object.defineProperty(globalThis, "localStorage", {
  value: createStorageMock(localMem),
  configurable: true,
})

const sessionMem: Record<string, string> = {}
Object.defineProperty(globalThis, "sessionStorage", {
  value: createStorageMock(sessionMem),
  configurable: true,
})
