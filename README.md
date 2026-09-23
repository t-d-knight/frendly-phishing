# Free Coffee QR: Cyber Awareness Month

A "scan for free coffee" poster that takes people to a friendly *you just got phished* page,
plus a live counter for the atrium TV.

| URL | What it is |
|---|---|
| `/` | Landing page the QR code points to. |
| `/live` | Full-screen counter for the TV. Polls every 3 seconds. |
| `/api/count` | JSON totals, if you want them for a report. |

**What gets stored:** one number (total scans) and the time of the last scan. That's it:
no IPs, user agents, names, devices, or which site/poster was scanned. Location was dropped
on purpose, because at small sites a per-site count could point to individual staff. A cookie (`cq_scanned`) stops the same phone from being counted
twice for 30 days. The count only goes up when the page's JavaScript runs, so Teams/Outlook link
previews and scanners that only fetch the URL don't inflate it.

## Deploy

This is a Cloudflare **Worker with static assets**: `public/` is the website, `src/index.js` is the
two-endpoint API, and `wrangler.toml` wires in the D1 database. You need a Cloudflare account and Node 18+.

### One-time setup (your own terminal)

```bash
npm install
npx wrangler login
npx wrangler d1 create coffee-qr          # copy the database_id it prints into wrangler.toml
npx wrangler d1 execute coffee-qr --remote --file=schema.sql
```

### Option A: deploy from Git (rebuilds on every push)

**Workers & Pages → Create → Import a repository**, then:

| Setting | Value |
|---|---|
| Build command | *(leave empty)* |
| Deploy command | `npx wrangler deploy` (the default) |

The Worker name in the dashboard must match `name` in `wrangler.toml`. The D1 binding comes from
`wrangler.toml`, so there's nothing to set in the dashboard. **Don't** put the one-time setup commands
in the build or deploy command, because they need your login.

### Option B: deploy from your terminal

```bash
npx wrangler deploy
```

You'll get `https://frendly-phishing.<your-subdomain>.workers.dev`. To add your own domain, go to
**Settings → Domains & Routes → Add → Custom domain** (for example `qr.demo-domain.xyz`). If the
domain's DNS is on Cloudflare, it sets up DNS and the certificate for you.

## Make the QR codes

```bash
pip install "qrcode[pil]"
python make_qr.py https://qr.demo-domain.xyz
```

This gives you `qr.png`. The same code goes on every poster at every site.

## Test locally

```bash
npx wrangler d1 execute coffee-qr --local --file=schema.sql
npx wrangler dev
# open http://localhost:8787/ and http://localhost:8787/live
```

## Handy commands

```bash
# Current numbers
npx wrangler d1 execute coffee-qr --remote --command "SELECT * FROM counter"

# Reset before launch (clears your own test scans)
npx wrangler d1 execute coffee-qr --remote --command "DELETE FROM counter"
```

Your own phone keeps its "already counted" cookie. To re-test, clear site data or use a private tab.

## Before you stick posters up

- Get sign-off from your manager, comms, and privacy. It's a sanctioned simulation, so keep the email that says so.
- Tell the service desk. Someone *will* report the poster, which is the behaviour you want, so thank them.
- Check the location text and "lolly" offer on `public/index.html` are what you actually want to say.
- Reset the counter (see above) after testing.
- Put the TV on `/live` in a kiosk/full-screen browser. It shows a red "can't reach counter" note if the network drops, and recovers on its own.
