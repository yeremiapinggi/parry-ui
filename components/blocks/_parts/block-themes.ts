// Theme presets defined as [data-theme] blocks in app/globals.css. Plain module so server code can import it too.
export const blockThemes = [
  { id: "classic", label: "Classic" },
  { id: "nightshift", label: "Nightshift" },
  { id: "lagoon", label: "Lagoon" },
  { id: "contrast", label: "Contrast" },
] as const

export type BlockThemeId = (typeof blockThemes)[number]["id"]

export const isBlockTheme = (v: unknown): v is BlockThemeId => blockThemes.some((t) => t.id === v)

// Themes live on <html> so portaled overlays (menus, dialogs, sheets) pick them up.
export function applyBlockTheme(theme: BlockThemeId) {
  const html = document.documentElement
  html.dataset.theme = theme
  html.classList.toggle("dark", theme === "nightshift")
  html.style.colorScheme = theme === "nightshift" ? "dark" : "light"
  const url = new URL(window.location.href)
  url.searchParams.set("theme", theme)
  window.history.replaceState(window.history.state, "", url)
}
