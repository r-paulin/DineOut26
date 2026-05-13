import { afterEach, describe, expect, it, vi } from "vitest"
import { addRecentSearch, getRecentSearches } from "./recentSearches"

function installLocalStorageMock(storage: {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    writable: true,
    value: storage,
  })
}

afterEach(() => {
  // Keep tests isolated from each other.
  Reflect.deleteProperty(globalThis, "localStorage")
})

describe("recentSearches", () => {
  it("ignores storage write failures when adding recent search", () => {
    installLocalStorageMock({
      getItem: () => JSON.stringify(["Sushi"]),
      setItem: () => {
        throw new Error("Quota exceeded")
      },
    })

    expect(() => addRecentSearch("Pizza")).not.toThrow()
  })

  it("returns parsed string entries and drops invalid values", () => {
    installLocalStorageMock({
      getItem: () => JSON.stringify(["Pizza", 1, null, "Sushi"]),
      setItem: vi.fn(),
    })

    expect(getRecentSearches()).toEqual(["Pizza", "Sushi"])
  })
})
