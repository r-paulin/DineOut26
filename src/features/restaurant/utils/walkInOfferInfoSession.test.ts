import { afterEach, describe, expect, it } from "vitest"
import {
  hasSeenWalkInOfferInfoThisSession,
  markWalkInOfferInfoSeenThisSession,
} from "./walkInOfferInfoSession"

describe("walkInOfferInfoSession", () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it("starts unseen and marks seen for the tab session", () => {
    expect(hasSeenWalkInOfferInfoThisSession()).toBe(false)
    markWalkInOfferInfoSeenThisSession()
    expect(hasSeenWalkInOfferInfoThisSession()).toBe(true)
  })
})
