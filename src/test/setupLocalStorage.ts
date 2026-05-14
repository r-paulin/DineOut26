const mem: Record<string, string> = {}
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (k: string) => mem[k] ?? null,
    setItem: (k: string, v: string) => {
      mem[k] = v
    },
    removeItem: (k: string) => {
      delete mem[k]
    },
    clear: () => {
      for (const k of Object.keys(mem)) delete mem[k]
    },
    key: (i: number) => Object.keys(mem)[i] ?? null,
    get length() {
      return Object.keys(mem).length
    },
  },
  configurable: true,
})
