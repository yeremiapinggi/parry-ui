// Copies the tokens in app/globals.css into the `parry-theme` item of registry.json,
// so globals.css stays the single source of truth. Run via `npm run registry:build`.
import { readFileSync, writeFileSync } from "node:fs"

const root = new URL("../", import.meta.url)
const css = readFileSync(new URL("app/globals.css", root), "utf8")
const registryPath = new URL("registry.json", root)
const registry = JSON.parse(readFileSync(registryPath, "utf8"))

function block(selector) {
  const match = css.match(new RegExp(`^${selector.replace(/[.$]/g, "\\$&")} \\{([^}]*)\\}`, "m"))
  if (!match) throw new Error(`globals.css: block "${selector}" not found`)
  return Object.fromEntries([...match[1].matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)].map((m) => [m[1], m[2].trim()]))
}

const theme = Object.fromEntries(Object.entries(block("@theme inline")).filter(([k]) => k.startsWith("font-")))
const fontImports = [...css.matchAll(/^@import "(@fontsource[^"]+)";/gm)].map((m) => `@import "${m[1]}"`)

const item = registry.items.find((i) => i.name === "parry-theme")
item.dependencies = fontImports.map((i) => i.match(/"(.+)"/)[1])
item.css = Object.fromEntries(fontImports.map((i) => [i, {}]))
item.cssVars = { theme, light: block(":root"), dark: block(".dark") }

writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n")
console.log(`parry-theme: ${Object.keys(item.cssVars.light).length} light, ${Object.keys(item.cssVars.dark).length} dark, ${fontImports.length} font imports`)
