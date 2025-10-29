// /api/watches
// Pages Function using KV for storage
// Bindings you will add in the dashboard:
//   KV_WATCHES  -> KV namespace
//   SAVE_TOKEN  -> a secret for write access

export async function onRequestGet(context) {
  const { env } = context;
  const json = (await env.KV_WATCHES.get("watches.json")) || "[]";
  return new Response(json, { headers: { "content-type": "application/json" } });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${env.SAVE_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.text();      // expect JSON array/object
  try { JSON.parse(body); } catch { return new Response("Bad JSON", { status: 400 }); }
  await env.KV_WATCHES.put("watches.json", body);
  return new Response("ok");
}

// Optional: delete resets to empty array
export async function onRequestDelete(context) {
  const { request, env } = context;
  const auth = request.headers.get("authorization") || "";
  if (auth !== `Bearer ${env.SAVE_TOKEN}`) return new Response("Unauthorized", { status: 401 });
  await env.KV_WATCHES.put("watches.json", "[]");
  return new Response("ok");
}
