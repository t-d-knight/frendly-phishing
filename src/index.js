// Worker entry point. Static files in ./public are served automatically;
// anything that isn't a file (i.e. /api/*) lands here.
//
// POST /api/scan  -> +1 (once per phone, via cookie). Called by the landing page's JS,
//                    so link-preview bots that only GET the page don't count.
// GET  /api/count -> { total, last_at } for the atrium display.
//
// Nothing about the person, device or location is stored: it's one number.

const COOKIE = "cq_scanned";
const JSON_HEADERS = { "content-type": "application/json", "cache-control": "no-store" };

async function scan(request, env) {
  const cookies = request.headers.get("Cookie") || "";
  const alreadyCounted = new RegExp(`(?:^|;\\s*)${COOKIE}=1`).test(cookies);

  if (!alreadyCounted) {
    await env.DB.prepare(
      `INSERT INTO counter (id, n, last_at) VALUES (1, 1, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET n = n + 1, last_at = datetime('now')`
    ).run();
  }
  const row = await env.DB.prepare("SELECT COALESCE(MAX(n), 0) AS total FROM counter").first();

  const headers = new Headers(JSON_HEADERS);
  if (!alreadyCounted) {
    headers.append("set-cookie", `${COOKIE}=1; Max-Age=2592000; Path=/; Secure; HttpOnly; SameSite=Lax`);
  }
  return new Response(JSON.stringify({ counted: !alreadyCounted, total: row.total }), { headers });
}

async function count(env) {
  const row = await env.DB.prepare("SELECT n, last_at FROM counter WHERE id = 1").first();
  return new Response(JSON.stringify({ total: row ? row.n : 0, last_at: row ? row.last_at : "" }), {
    headers: JSON_HEADERS,
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/scan" && request.method === "POST") return scan(request, env);
    if (pathname === "/api/count" && request.method === "GET") return count(env);
    if (pathname.startsWith("/api/")) return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
