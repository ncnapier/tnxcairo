# Egypt Trip — TD / NN

A one-page, dark travel dashboard built with HTML, CSS, and vanilla JavaScript.
Designed for VS Code and Cloudflare Pages.

## What's included
- Countdown and automatic trip-phase display using your ticket times:
  - BA222: Nov 20, 2026, 6:25 PM Nashville time (BNA → LHR)
  - BA398: Nov 21, 2026, approximately 2:25 PM London time (LHR → CAI)
  - BA399: Nov 28, 2026, 6:40 AM Cairo time (CAI → LHR)
  - BA223: time intentionally left configurable until you confirm the ticket time
- Flight status panel and route-progress indicator.
- Private owner login, daily text updates, photo upload, and public journal view.
- Cloudflare Pages Functions + D1 + R2 backend.

## Important flight tracking note
The flight tracker is wired to the Aviationstack API through a server-side function. You must create an Aviationstack account and add its API key as the `AVIATIONSTACK_API_KEY` secret in Cloudflare. API plans differ in live-flight coverage and request limits. If the provider does not return a live record, the page falls back to your scheduled itinerary and clearly labels the data as scheduled/unavailable — it does not fabricate live position.

The BA398 time you supplied was approximate. It is configured as 2:25 PM London local time and can be edited in `public/js/config.js` after checking your ticket. The BA223 time is blank until you supply it.

## Run locally
1. Install Node.js (LTS).
2. Open this folder in VS Code.
3. In the terminal:
   ```bash
   npm install
   npx wrangler login
   npx wrangler pages dev public --compatibility-date=2026-11-16
   ```
   For local API routes and bindings, use the full Pages dev command after creating the D1/R2 resources as described below.
4. For a quick visual-only preview, open `public/index.html` with VS Code Live Server. Login, uploads, and live flight API calls need the Pages Functions runtime.

## Cloudflare deployment (free hosting)
1. Create a free Cloudflare account: https://dash.cloudflare.com/
2. Create a D1 database named `egypt-trip-db`.
3. Create an R2 bucket named `egypt-trip-photos`.
4. In `wrangler.toml`, replace `REPLACE_WITH_D1_DATABASE_ID` with the database ID from Cloudflare.
5. Create the D1 table:
   ```bash
   npx wrangler d1 execute egypt-trip-db --remote --file=./schema.sql
   ```
6. Deploy the Pages project:
   ```bash
   npx wrangler pages project create tdnncairo
   npx wrangler pages deploy public --project-name=tdnncairo
   ```
   Pages Functions are deployed from the root `functions/` folder when deploying with Wrangler Pages. If using Git integration, connect this repository and set the build output directory to `public`.
7. In Cloudflare Pages → Settings → Functions → R2, bind `PHOTOS` to `egypt-trip-photos`.
8. Add these Pages environment variables/secrets:
   - `ADMIN_PASSWORD`: choose a strong private password.
   - `SESSION_SECRET`: long random string (32+ characters).
   - `AVIATIONSTACK_API_KEY`: your Aviationstack key.
   - `SITE_TITLE`: `THE EGYPT JOURNEY`
9. Bind D1 as `DB` to `egypt-trip-db`.
10. Visit the deployed site. Choose **Owner login** at the bottom of the page.

## Free URL and custom domain
The free site URL will be similar to:
`https://tdnncairo.pages.dev`

That exact Pages project name may be available; Cloudflare confirms availability when you create the project. If it is taken, use `tdnn-egypt` or `tdnncairo-trip`.

`tdnncairo.com` is a separate paid domain registration. You can buy it from a registrar and connect it to Cloudflare Pages later. Hosting can remain on the free tier.

## Security / practical notes
- Do not commit `.env`, API keys, passwords, or session secrets.
- The public page shows only published journal entries.
- Owner login is protected by a server-side password and signed HttpOnly cookie.
- Photo files are stored in R2; journal metadata is stored in D1.
- This is a personal trip journal, not a high-security publishing platform. Use a unique password.
- The API provider may not expose exact flight coordinates on its free plan. The UI only animates a plane when the API returns a valid position/progress value.
