// Guards the Sociomile page blocks: theme tokens only (no hex / arbitrary / palette colours) and DS-only imports.
// Usage: node scripts/check-blocks.mjs [dir]  — defaults to components/blocks; exits 1 on any violation.
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

const dir = process.argv[2] ?? "components/blocks"
const palette = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black"
const colorRules = [
  [/#[0-9a-fA-F]{3,8}\b/, "hex colour"],
  [/-\[(#|rgb|hsl|oklch|color:)/, "arbitrary colour class"],
  [/\b(rgb|rgba|hsl|hsla|oklch)\(/, "colour function"],
  [new RegExp(`\\b(bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|divide|accent|caret|shadow)-(${palette})\\b`), "palette colour class"],
]
// recharts is allowed in dashboard-01 only: components/ui/chart is a recharts wrapper.
const allowedImport = (spec, file) =>
  /^(react|react-dom|lucide-react|cn)$/.test(spec) ||
  /^react\//.test(spec) ||
  /^next(\/|$)/.test(spec) ||
  /^@\/components\/(ui|blocks)\//.test(spec) ||
  spec.startsWith(".") ||
  (spec === "recharts" && file.includes("dashboard-01"))

const files = (function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.tsx?$/.test(e.name) ? [join(d, e.name)] : []
  )
})(dir)

const problems = []
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, i) => {
    const at = `${relative(process.cwd(), file)}:${i + 1}`
    if (!file.endsWith("channel-meta.ts")) {
      for (const [re, what] of colorRules) if (re.test(line)) problems.push(`${at} ${what}: ${line.trim()}`)
    }
    for (const m of line.matchAll(/(?:from\s+|import\s+)["']([^"']+)["']/g)) {
      if (!allowedImport(m[1], file)) problems.push(`${at} import outside allowlist: ${m[1]}`)
    }
  })
}

for (const p of problems) console.log(`FAIL ${p}`)
console.log(`check-blocks: ${files.length} files, ${problems.length} problem(s)`)
process.exit(problems.length ? 1 : 0)
