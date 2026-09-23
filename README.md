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

## Deploy (about 10 minutes)

You need a Cloudflare account and Node 18+.

```bash
npm install
npx wrangler login

# 1. Create the database. Copy the database_id it prints into wrangler.toml
npx wrangler d1 create coffee-qr

# 2. Create the table
npx wrangler d1 execute coffee-qr --remote --file=schema.sql

# 3. Create the Pages project and deploy (functions/ is picked up automatically)
npx wrangler pages project create coffee-qr --production-branch main
npx wrangler pages deploy
```

Wrangler reads the D1 binding from `wrangler.toml`. If the counter shows nothing after deploying,
check **Pages → coffee-qr → Settings → Bindings** and confirm that `DB` points at the `coffee-qr` database.

You'll get `https://coffee-qr.pages.dev` (or pick a different project name). You can also
attach a custom domain under **Custom domains**. A believable-but-harmless domain makes the lesson
land harder, but **don't** use anything that imitates the hospital's real domain or branding.

## Make the QR codes

```bash
pip install "qrcode[pil]"
python make_qr.py https://coffee-qr.pages.dev
```

This gives you `qr.png`. The same code goes on every poster at every site.

## Test locally

```bash
npx wrangler d1 execute coffee-qr --local --file=schema.sql
npx wrangler pages dev
# open http://localhost:8788/ and http://localhost:8788/live
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
