// ------------------------------------------------------------
// Cloudflare Pages Function for Watch Gallery Sync
// ------------------------------------------------------------
// This file exposes three endpoints:
//   GET    /api/watches      → returns the current JSON array
//   POST   /api/watches      → overwrites it (auth required)
//   DELETE /api/watches      → clears it (auth required)
//
// Cloudflare Bindings (set in Pages → Settings → Functions → Bindings):
//   KV_WATCHES  = your KV namespace
//   SAVE_TOKEN  = a secret token for authentication
//
// KV storage key: "watches.json"
//
// ------------------------------------------------------------

const KEY = "watches.json";

// ---------------------- GET ----------------------
export async function onRequestGet({ env }) {
  try {
    // Read the current JSON array from KV (default to empty array)
    const data = await env.KV_WATCHES.get(KEY);
    const json = data || "[]";
    return new Response(json, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    return new Response("Error reading KV: " + err.message, { status: 500 });
  }
}

// ---------------------- POST ----------------------
export async function onRequestPost({ request, env }) {
  // Simple bearer-token authentication
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${env.SAVE_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const bodyText = await request.text();
    // Validate JSON before saving
    JSON.parse(bodyText);
    await env.KV_WATCHES.put(KEY, bodyText);
    return new Response("ok");
  } catch (err) {
    return new Response("Invalid JSON: " + err.message, { status: 400 });
  }
}

// ---------------------- DELETE ----------------------
export async function onRequestDelete({ request, env }) {
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${env.SAVE_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    await env.KV_WATCHES.put(KEY, "[]");
    return new Response("Gallery cleared.");
  } catch (err) {
    return new Response("Error clearing KV: " + err.message, { status: 500 });
  }
}
