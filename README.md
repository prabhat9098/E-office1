# E-Office | Client demo (backend + sample data)

This is a **demonstration**, not the production government/official E-Office system. All applicant and office records are **fictional**. The original ZIP did not contain the PHP server/database, so this package supplies a standalone replacement REST API, demo login and SQLite storage with the existing HTML website.

## Quick start

Requires **Node.js 22 or newer** (Node's built-in `node:sqlite` module).

```bash
npm start
```

Open **http://localhost:3000**. The site and REST API run on the **same port**, so no PHP, MySQL, external API credentials, or CORS configuration is required. On first startup `data/eoffice.sqlite` is initialized automatically with sample records.

## Demo credentials

| Purpose | Credential |
|---|---|
| Admin email | `demo.admin@eoffice.test` |
| Admin password | `Demo@2026!` |
| Demo staff phone | `9876543210` |
| Second staff phone | `9123456789` |
| Demo staff OTP (displayed on login screen, NOT sent as SMS) | `123456` |
| User-management edit/delete PIN (from original UI) | `9098` |

The admin login form is on the first page. For staff login, turn on the user-login switch. **Do not use these demonstration credentials for production.** You can override admin username/password and staff demo OTP via `DEMO_ADMIN_EMAIL`, `DEMO_ADMIN_PASSWORD`, and `DEMO_USER_OTP` environment variables **before the database is initially created**. Changing the admin environment variables after seed initialization will not change the stored account automatically.

## Working demo features

- Actual server-side admin and demo staff authentication, with HTTP-only session cookie.
- Dashboard totals and charts derived from database records.
- Application creation, list, search/filter and stage changes saved to SQLite.
- Incoming and outgoing application forms, and attachment upload (PDF/JPG/PNG; max 5 MB).
- Create/list/edit/delete categories, departments, applicant types and staff users.
- User data overview based on application records.
- Seeded **18 fictional applications**, 7 categories, 7 departments, 5 applicant types and 4 staff users. Each demo staff login has a sample application in its own account.
- User-side applications use the same backend instead of browser-local-only storage.
- Dedicated sample-data banner appears on all pages.

## Endpoints

- `GET /api/health` — live check (unauthenticated)
- `POST /api/auth/login` — admin email/password login
- `POST /api/auth/demo-user` — demo phone/OTP login
- `POST /api/auth/logout`
- `GET /api/summary`
- `GET/POST/PUT/DELETE /api/categories`, `/api/departments`, `/api/applicant_types`, `/api/users`
- `GET/POST/PUT /api/applications`

HTML pages beyond `/index.html` and all management API actions require an authenticated session. Staff users can view their own applications and submit new ones; admin users can manage all records. Demo data is stored in `data/`, excluded from source control.

## Deploy to Render

1. Extract this ZIP and push **its files without `.git` or `data/`** into a new private Git repository.
2. In Render choose **New > Web Service**, connect that repository, and use the included `render.yaml` as a guide (Node 22, build `npm install --omit=dev`, start `npm start`).
3. Visit the Render-generated `https://...onrender.com` address and open `/api/health` to confirm it returns `success: true`.
4. Sign in with the credentials above and test application creation / stage changes.

**Persistence warning:** SQLite stores changes on the host filesystem. Hosting tiers without a persistent disk can lose edits or uploads after a restart/redeploy, at which point the demo seed is recreated. For a longer-lasting client demo, configure a persistent disk and `DATA_DIR` (e.g. `/var/data/eoffice`), or migrate the demo database to a managed service. Availability and disk support depend on your Render plan.

## Demo-only limitations

- Original external PHP source and its production database were not supplied. The replacement backend is independently functional but does **not** synchronize production data.
- OTP is fixed/disclosed for presentation; no real SMS is sent. WhatsApp notifications and external integrations are not enabled.
- The original client-facing user-management PIN is still present in the old HTML. **The application has not undergone a production security audit.**
- CSS/framework assets load from public CDNs; browsers need internet access for full styling.
- Only fictional demo data is included; never upload real citizen/client information to a public demo deployment.
- Do not share this publicly as an official government service.

## Local verification

```bash
curl http://localhost:3000/api/health
# Expected: {"success":true,"mode":"demo","database":"sqlite","applications":18}
```
