// POST /api/scan
// Called by the landing page's JavaScript (so link-preview bots and Teams
// unfurls that only do a GET don't inflate the count).
// A cookie stops the same phone being counted twice.
// Nothing about the person or where they scanned is stored: it's one number.

const COOKIE = "cq_scanned";

export async function onRequestPost({ request, env }) {
  const cookies = request.headers.get("Cookie") || "";
  const alreadyCounted = new RegExp(`(?:^|;\\s*)${COOKIE}=1`).test(cookies);

  if (!alreadyCounted) {
    await env.DB.prepare(
      `INSERT INTO counter (id, n, last_at) VALUES (1, 1, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET n = n + 1, last_at = datetime('now')`
    ).run();
  }

  const row = await env.DB.prepare("SELECT COALESCE(MAX(n), 0) AS total FROM counter").first();

  const headers = new Headers({ "content-type": "application/json", "cache-control": "no-store" });
  if (!alreadyCounted) {
    headers.append("set-cookie", `${COOKIE}=1; Max-Age=2592000; Path=/; Secure; HttpOnly; SameSite=Lax`);
  }
  return new Response(JSON.stringify({ counted: !alreadyCounted, total: row.total }), { headers });
}
