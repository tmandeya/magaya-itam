# Magaya Mining — IT Asset Management System

Enterprise-grade IT asset tracking, lifecycle management, and compliance reporting for Magaya Mining operations.

**Stack:** Next.js 14 · Supabase · Vercel · TypeScript · Tailwind CSS

---

## Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/magaya-itam.git
cd magaya-itam

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase credentials (see Setup Supabase below)

# 4. Run locally
npm run dev
# Open http://localhost:3000
```

---

## Full Setup Guide

### STEP 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New Project**
3. Fill in:
   - **Name:** `magaya-itam`
   - **Database Password:** (save this securely)
   - **Region:** Choose the closest to Harare (e.g., `South Africa (East)` or `Europe (West)`)
4. Click **Create new project** and wait for provisioning (~2 minutes)
5. Once ready, go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### STEP 2 — Run the Database Migration

**Option A — Via Supabase Dashboard (Easiest):**

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the editor and click **Run**
5. Then run `supabase/seed.sql` the same way to load sample data

**Option B — Via Supabase CLI:**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push

# Run seed data
psql "YOUR_SUPABASE_DB_URL" -f supabase/seed.sql
```

### STEP 3 — Configure Supabase Auth

1. In Supabase Dashboard → **Authentication → Providers**
2. Enable **Email** provider (enabled by default)
3. Under **URL Configuration**, set:
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** Add `http://localhost:3000/auth/callback`
4. Later, add your Vercel production URL to both fields

**Optional — Microsoft Entra ID (SSO):**

1. Go to **Authentication → Providers → Azure (Microsoft)**
2. Enable it and enter your Azure AD:
   - Client ID
   - Client Secret
   - Tenant URL: `https://login.microsoftonline.com/YOUR_TENANT_ID`
3. In Azure Portal, register the app and add redirect URI:
   `https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback`

### STEP 4 — Create a GitHub Repository

```bash
# Initialize git (if not already)
cd magaya-itam
git init
git add .
git commit -m "Initial commit: Magaya Mining ITAM"

# Create repo on GitHub (via web or CLI)
gh repo create magaya-itam --private --push
# OR
git remote add origin https://github.com/YOUR_USERNAME/magaya-itam.git
git branch -M main
git push -u origin main
```

### STEP 5 — Deploy to Vercel

**Option A — Via Vercel Dashboard (Recommended):**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New → Project**
3. Select your `magaya-itam` repository
4. Vercel auto-detects Next.js — leave framework preset as-is
5. Under **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

6. Click **Deploy**
7. Once deployed, copy the production URL (e.g., `https://magaya-itam.vercel.app`)
8. Go back to Supabase → **Authentication → URL Configuration**:
   - Add production URL to **Site URL** and **Redirect URLs**

**Option B — Via Vercel CLI:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Deploy to production
vercel --prod
```

### STEP 6 — Set Up GitHub Actions (CI/CD)

The repo includes `.github/workflows/ci-cd.yml` for automated deployments.

1. In GitHub → **Settings → Secrets and variables → Actions**
2. Add these repository secrets:

   | Secret | Where to find it |
   |--------|-------------------|
   | `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create |
   | `VERCEL_ORG_ID` | Vercel → Settings → General → Your ID |
   | `VERCEL_PROJECT_ID` | Vercel → Project Settings → General → Project ID |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
   | `SUPABASE_ACCESS_TOKEN` | Supabase → Account → Access Tokens |
   | `SUPABASE_PROJECT_ID` | Supabase → Settings → General → Reference ID |

3. Now every push to `main` will:
   - Run lint & type checks
   - Build the app
   - Deploy to Vercel production
   - Run database migrations

---

## Project Structure

```
magaya-itam/
├── app/                          # Next.js App Router
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── callback/route.ts     # OAuth callback
│   ├── dashboard/
│   │   ├── layout.tsx            # Auth-protected layout
│   │   └── page.tsx              # Main ITAM dashboard
│   ├── globals.css               # Global styles + Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Redirect to /dashboard
├── components/
│   └── itam-app.tsx              # Main ITAM application component
├── lib/
│   ├── database.types.ts         # Supabase TypeScript types
│   ├── supabase-browser.ts       # Browser Supabase client
│   ├── supabase-server.ts        # Server Supabase client
│   └── utils.ts                  # Utility functions
├── public/
│   ├── logo.png                  # Magaya Mining logo
│   ├── logo-dark.png             # Logo for dark backgrounds
│   └── favicon.ico               # Favicon
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Complete database schema
│   ├── seed.sql                  # Sample data
│   └── config.toml               # Supabase config
├── .github/workflows/
│   └── ci-cd.yml                 # GitHub Actions pipeline
├── middleware.ts                  # Auth middleware
├── next.config.js
├── tailwind.config.ts
├── package.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## Database Schema Overview

The system uses 12+ tables with Row Level Security (RLS) enabled:

- **organizations** — Multi-tenant root
- **sites** — Physical locations (auto-generated SITE-XXXX codes)
- **departments** / **sections** — Organizational hierarchy
- **profiles** — User accounts extending Supabase Auth
- **user_site_access** — Granular site permissions
- **assets** — Core asset register (auto-generated asset codes)
- **asset_relationships** — Parent-child / bundle tracking
- **asset_types** — Configurable per-category types
- **transfers** — Inter-site transfer workflow
- **transfer_items** — Assets in each transfer
- **repairs** — Repair ticket lifecycle
- **audit_log** — Immutable audit trail (cannot be modified or deleted)
- **attachments** — Generic file references

Key features: auto-generated sequential codes, full-text search indexes, automatic audit logging via triggers, depreciation calculation functions, and realtime subscriptions.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `NEXT_PUBLIC_APP_URL` | No | Application URL for links |
| `AZURE_AD_CLIENT_ID` | No | Microsoft Entra ID client ID |
| `AZURE_AD_CLIENT_SECRET` | No | Microsoft Entra ID client secret |
| `AZURE_AD_TENANT_ID` | No | Microsoft Entra ID tenant ID |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Push Supabase migrations |
| `npm run db:reset` | Reset database |
| `npm run db:types` | Generate TypeScript types from Supabase |

---

## Adding Supabase to Your Vercel URL Config

After deploying to Vercel, you must update Supabase so that auth callbacks work:

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to: `https://your-project.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-project.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (keep for local dev)

---

## Troubleshooting

**"Invalid API key" errors:**
Make sure `.env.local` has the correct Supabase keys and restart `npm run dev`.

**Auth not working after deploy:**
Verify Vercel environment variables match your Supabase project, and that redirect URLs are configured in Supabase Auth settings.

**Database migration fails:**
Check that your Supabase project is using PostgreSQL 15+ and that extensions (`uuid-ossp`, `pg_trgm`) are available.

**Build errors with recharts/SSR:**
The dashboard page uses `dynamic(() => import(...), { ssr: false })` to avoid SSR hydration issues with chart libraries.

---

## License

Proprietary — Magaya Mining (Pvt) Ltd. All rights reserved.
