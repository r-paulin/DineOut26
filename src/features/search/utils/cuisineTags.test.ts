import { describe, expect, it } from "vitest"
import {
  filterTagsToCuisineLabels,
  parseTagLine,
} from "./cuisineTags"

describe("parseTagLine", () => {
  it("splits on middot and comma", () => {
    expect(parseTagLine("Mediterranean · Seafood")).toEqual([
      "Mediterranean",
      "Seafood",
    ])
    expect(parseTagLine("Italian, Pizza")).toEqual(["Italian", "Pizza"])
  })
})

describe("filterTagsToCuisineLabels", () => {
  it("keeps only Cuisine filter labels", () => {
    expect(
      filterTagsToCuisineLabels([
        "Michelin Listed",
        "Wine Pairing",
        "Mediterranean",
        "Seafood",
      ]),
    ).toEqual(["Mediterranean", "Seafood"])
  })

  it("maps partial labels like Sushi to Japanese / Sushi", () => {
    expect(filterTagsToCuisineLabels(["Sushi", "Burgers"])).toEqual([
      "Japanese / Sushi",
      "Burgers",
    ])
  })

  it("dedupes", () => {
    expect(
      filterTagsToCuisineLabels(["Mediterranean", "mediterranean"]),
    ).toEqual(["Mediterranean"])
  })
})
