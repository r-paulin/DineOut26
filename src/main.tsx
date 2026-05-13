import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { App } from "@/app/App"
import { scheduleDiscoverMapWarmup } from "@/features/map/prefetchDiscoverMapData"

scheduleDiscoverMapWarmup()

function parseSafeAreaPx(value: string | null): number | null {
  if (value == null) return null
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.min(200, parsed))
}

const params = new URLSearchParams(window.location.search)
const safeTop = parseSafeAreaPx(params.get("safeTop"))
const safeBottom = parseSafeAreaPx(params.get("safeBottom"))
if (safeTop !== null) {
  document.documentElement.style.setProperty("--safe-area-top", `${safeTop}px`)
}
if (safeBottom !== null) {
  document.documentElement.style.setProperty(
    "--safe-area-bottom",
    `${safeBottom}px`,
  )
}

const theme = params.get("theme")
if (theme === "dark") {
  document.documentElement.classList.add("dark")
  document.documentElement.setAttribute("data-mode", "dark")
} else {
  document.documentElement.classList.remove("dark")
  document.documentElement.setAttribute("data-mode", "light")
}

const rootEl = document.getElementById("root")
if (!rootEl) {
  console.error('DineOut: missing mount node <div id="root"></div>.')
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
