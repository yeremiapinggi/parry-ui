// Self-check for the Developer Portal template's pure logic. Run: npm run check:portal
import assert from "node:assert/strict"

import { PRODUCTS, SEED_APPS, USAGE_DAYS, eventsForScopes, getRateLimit, getUsage, summarizeUsage, hasScope, isScopeSubset, simulateDelivery, toggleScope, trimKeys, validateAppDraft, validateRedirectUri, validateWebhookDraft } from "../lib/developer-portal-data.ts"

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

// Webhooks: events follow the owning app's scopes; endpoints must be https.
const ripple = SEED_APPS.find((app) => app.id === "29507667")
assert.ok(eventsForScopes(ripple.scopes).every((event) => event.startsWith("ripple10.")))
const hook = { url: "https://hooks.example.com/ivo", appId: ripple.id, events: ["ripple10.mention.created"] }
assert.deepEqual(validateWebhookDraft(hook, SEED_APPS), {})
assert.ok(validateWebhookDraft({ ...hook, url: "http://hooks.example.com" }, SEED_APPS).url)
assert.ok(validateWebhookDraft({ ...hook, events: [] }, SEED_APPS).events)
assert.ok(validateWebhookDraft({ ...hook, events: ["sociomile.ticket.created"] }, SEED_APPS).events, "event outside the app's scopes")
assert.ok(validateWebhookDraft({ ...hook, appId: "" }, SEED_APPS).appId)
assert.equal(simulateDelivery("https://hooks.example.com/ivo", 1).status, 200)
assert.equal(simulateDelivery("https://fail.example.com/ivo", 1).status, 500)

// Usage: every filter reads from the same per-app, per-endpoint shares.
const near = (actual, expected, label) => assert.ok(Math.abs(actual - expected) <= Math.max(60, expected * 0.002), `${label}: ${actual} vs ${expected}`)
const all = getUsage({ range: 30, appId: "all", product: "all" }, SEED_APPS)
near(all.summary.requests, summarizeUsage(USAGE_DAYS.slice(-30)).requests, "all apps match the raw series")
assert.equal(all.days.length, 30)
near(PRODUCTS.reduce((sum, { key }) => sum + getUsage({ range: 30, appId: "all", product: key }, SEED_APPS).summary.requests, 0), all.summary.requests, "products add up")
near(all.endpoints.reduce((sum, row) => sum + row.requests, 0), all.summary.requests, "endpoints add up")
assert.equal(getUsage({ range: 7, appId: "29507667", product: "sociomile" }, SEED_APPS).summary.requests, 0, "no traffic outside the app's scopes")
const fresh = { ...SEED_APPS[0], id: "new-app" }
assert.equal(getUsage({ range: 7, appId: "new-app", product: "all" }, [...SEED_APPS, fresh]).summary.requests, 0, "new apps have no traffic")
const limit = getRateLimit(SEED_APPS[1], SEED_APPS)
assert.equal(limit.quota, 10000)
assert.ok(limit.used > 0 && limit.used <= limit.quota)

console.log("developer-portal checks passed")
