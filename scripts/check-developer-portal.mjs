// Self-check for the Developer Portal template's pure logic. Run: npm run check:portal
import assert from "node:assert/strict"

import { SEED_APPS, hasScope, isScopeSubset, toggleScope, trimKeys, validateAppDraft, validateRedirectUri } from "../lib/developer-portal-data.ts"

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

// Key scopes stay within the app's scopes; narrowing the app trims keys.
const appScopes = [{ product: "sociomile", access: "write" }, { product: "cognivo", access: "read" }]
assert.ok(isScopeSubset([{ product: "sociomile", access: "read" }], appScopes))
assert.ok(!isScopeSubset([{ product: "cognivo", access: "write" }], appScopes))
const key = (scopes, revoked = false) => ({ id: "k", name: "k", last4: "0000", scopes, createdAt: "", lastUsed: null, expiresAt: null, revoked })
const trimmed = trimKeys([key(appScopes), key([{ product: "cognivo", access: "read" }]), key(appScopes, true)], [{ product: "sociomile", access: "read" }])
assert.deepEqual(trimmed.keys[0].scopes, [{ product: "sociomile", access: "read" }])
assert.deepEqual(trimmed.keys[1].scopes, [])
assert.equal(trimmed.affected, 2, "revoked keys are not counted")

// Redirect URIs: https, or http only on localhost; no duplicates.
assert.equal(validateRedirectUri("https://app.example.com/cb", []), null)
assert.equal(validateRedirectUri("http://localhost:3000/cb", []), null)
assert.ok(validateRedirectUri("http://app.example.com/cb", []))
assert.ok(validateRedirectUri("not a url", []))
assert.ok(validateRedirectUri("https://app.example.com/cb", ["https://app.example.com/cb"]))

console.log("developer-portal checks passed")
