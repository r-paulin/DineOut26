import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { scheduleSnackbarAdd } from "./scheduleSnackbarAdd"

describe("scheduleSnackbarAdd", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "requestAnimationFrame",
      (cb: FrameRequestCallback) => {
        return setTimeout(() => cb(0), 0) as unknown as number
      },
    )
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      clearTimeout(id)
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("calls add after two animation frames", async () => {
    const add = vi.fn()
    scheduleSnackbarAdd(add, { description: "Done" })
    expect(add).not.toHaveBeenCalled()
    await new Promise((r) => setTimeout(r, 5))
    expect(add).toHaveBeenCalledWith({ description: "Done" })
  })

  it("cancel prevents add", async () => {
    const add = vi.fn()
    const cancel = scheduleSnackbarAdd(add, { description: "Done" })
    cancel()
    await new Promise((r) => setTimeout(r, 5))
    expect(add).not.toHaveBeenCalled()
  })
})
