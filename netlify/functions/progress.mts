import type { Config } from "@netlify/functions"
import { getStore } from "@netlify/blobs"

// Bayo's study app saves one progress snapshot here; the parent page reads it with a PIN.
// The PIN is created once on /parent (stored salted + hashed in Blobs, never in this code).
// A PARENT_PIN environment variable, if set, takes priority: use it to reset a forgotten PIN.
const STORE = "bayo-progress"
const DATA_KEY = "bayo"
const AUTH_KEY = "parent-auth"
const SYNC_TOKEN = "bayo-sync-v1" // ships in the app; it only stops random posts
const MAX_BYTES = 400_000
const ITERATIONS = 210_000

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } })

const toHex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
const fromHex = (hex: string) => new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))

async function hashPin(pin: string, saltHex: string, iterations: number) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveBits"])
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: fromHex(saltHex), iterations, hash: "SHA-256" }, key, 256)
  return toHex(bits)
}
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
type Auth = { salt: string; hash: string; iterations: number; createdAt: number }

export default async (req: Request) => {
  const store = getStore({ name: STORE, consistency: "strong" })
  const envPin = (Netlify.env.get("PARENT_PIN") || "").trim()

  // The parent creates a PIN (only while none exists)
  if (req.method === "POST" && req.headers.has("x-setup-pin")) {
    const pin = (req.headers.get("x-setup-pin") || "").trim()
    if (envPin) return json({ error: "A PIN is already set." }, 409)
    if (!/^\d{4,12}$/.test(pin)) return json({ error: "Use 4 to 12 digits." }, 400)
    const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
    const auth: Auth = { salt, hash: await hashPin(pin, salt, ITERATIONS), iterations: ITERATIONS, createdAt: Date.now() }
    const { modified } = await store.setJSON(AUTH_KEY, auth, { onlyIfNew: true })
    if (!modified) return json({ error: "A PIN is already set." }, 409)
    return json({ ok: true })
  }

  // The app saves its progress snapshot
  if (req.method === "POST") {
    if (req.headers.get("x-sync-token") !== SYNC_TOKEN) return json({ error: "unauthorized" }, 401)
    const text = await req.text()
    if (text.length > MAX_BYTES) return json({ error: "too large" }, 413)
    let data: any
    try { data = JSON.parse(text) } catch { return json({ error: "bad json" }, 400) }
    if (!data || data.v !== 1 || typeof data.best !== "object" || typeof data.days !== "object") return json({ error: "bad shape" }, 400)
    data.receivedAt = Date.now()
    await store.setJSON(DATA_KEY, data)
    return json({ ok: true, receivedAt: data.receivedAt })
  }

  // The parent page reads it
  if (req.method === "GET") {
    const given = (req.headers.get("x-parent-pin") || "").trim()
    let ok = false
    if (envPin) ok = given !== "" && sameText(given, envPin)
    else {
      const auth = (await store.get(AUTH_KEY, { type: "json" })) as Auth | null
      if (!auth) return json({ needsSetup: true }, 428)
      ok = given !== "" && sameText(await hashPin(given, auth.salt, auth.iterations), auth.hash)
    }
    if (!ok) return json({ error: "Wrong PIN." }, 401)
    const data = await store.get(DATA_KEY, { type: "json" })
    return json(data === null ? { empty: true } : data)
  }
  return json({ error: "method not allowed" }, 405)
}

export const config: Config = {
  path: "/api/progress",
  method: ["GET", "POST"],
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
}
