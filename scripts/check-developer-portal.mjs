// Self-check for the Developer Portal template's pure logic. Run: npm run check:portal
import assert from "node:assert/strict"

import { SEED_APPS, hasScope, toggleScope, validateAppDraft } from "../lib/developer-portal-data.ts"

// Scopes: write implies read, unchecking read drops write.
let scopes = toggleScope([], "cognivo", "write", true)
assert.deepEqual(scopes, [{ product: "cognivo", access: "write" }])
assert.ok(hasScope(scopes, "cognivo", "read"))
assert.ok(!hasScope(scopes, "sociomile", "read"))
assert.deepEqual(toggleScope(scopes, "cognivo", "write", false), [{ product: "cognivo", access: "read" }])
assert.deepEqual(toggleScope(scopes, "cognivo", "read", false), [])
assert.deepEqual(toggleScope([{ product: "cognivo", access: "read" }], "cognivo", "read", true), [{ product: "cognivo", access: "read" }])

// App draft validation.
const draft = { name: "", description: "", environment: "Development", authMethod: "oauth", scopes: [] }
assert.deepEqual(Object.keys(validateAppDraft(draft, SEED_APPS, null)).sort(), ["name", "scopes"])
assert.ok(validateAppDraft({ ...draft, name: "SOCIOMILE-DEMO", scopes }, SEED_APPS, null).name)
assert.deepEqual(validateAppDraft({ ...draft, name: "sociomile-demo", scopes }, SEED_APPS, SEED_APPS[0].id), {})

console.log("developer-portal checks passed")
