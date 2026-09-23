// GET /api/count -> { total, last_at }
// Polled by the atrium display (live.html) every few seconds.
export async function onRequestGet({ env }) {
  const row = await env.DB.prepare("SELECT n, last_at FROM counter WHERE id = 1").first();
  return new Response(JSON.stringify({ total: row ? row.n : 0, last_at: row ? row.last_at : "" }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
