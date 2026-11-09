# TeslaX — EV Trade-in & Autonomous Market Platform

TeslaX is a high-performance web platform engineered for trading internal combustion engine (ICE) vehicles directly for Teslas. It features an **AI-powered trade-in appraisal engine**, real-time equity & private asset markets (TSLA, SpaceX, X), member wallet ledgering, and an administrative control room.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and backed by **MongoDB Atlas**, **Google Gemini AI**, and **Finnhub Live Feeds**.

---

## ⚡ Core Capabilities

### 1. AI-Powered Vehicle Appraisal Engine (`/swap`)
* **Gemini 3.5 Flash Integration:** Connects directly to Google Gemini API for analytical wholesale trade appraisals, real-time market commentary, and confidence scoring.
* **Black Book Algorithmic Fallback:** Comprehensive 50+ model knowledge base with original base MSRP baselines, real-world age depreciation curves, steep mileage degradation cliffs, and age-tiered salvage floors.
* **3-Layer Quota Shield:**
  1. **24-Hour In-Memory Cache:** Hashed vehicle traits and 2,500-mile buckets eliminate 80–90% of redundant API calls with 0ms latency.
  2. **Invisible Honeypot Anti-Bot Shield:** Traps scrapers and headless bots, preventing them from exhausting API quotas.
  3. **Soft Per-IP Rate Limiting:** Allows up to 8 fresh valuations per 10 minutes per IP. Any overflow automatically falls back to local algorithmic valuation without breaking user experience.
* **Modern Drag-and-Drop Uploader:** File drag-over states, live upload progress simulation, image preview, removal, and direct URL import.

### 2. Live Market Feeds & Asset Tracking (`/markets`)
* **Finnhub API Integration:** Real-time market quotes and percentage updates for TSLA (NASDAQ).
* **Yahoo Finance Historicals:** 30-day interactive SVG charts with crosshairs and timeframe filters (1D, 1W, 1M, 1Y, ALL).
* **Desk-Marked Private Equity:** Track and trade private tokens for **SpaceX (`SPCX`)** and **X Corp (`X`)** anchored to institutional marks.
* **Paper Trading & Portfolio Ledger:** Execute buy/sell orders, track real-time position cost bases, unrealized P/L, and cash balances.

### 3. Member Portal (`/dashboard`)
* **Overview & KPI Cards:** Live trade-in status, total portfolio valuation, and cash wallet balance.
* **Vehicle Showroom (`/dashboard/showroom`):** Apply evaluated trade-in credits towards brand-new Teslas (Cybertruck, Model 3, Model Y, Model S, Model X, Semi, Roadster).
* **Wallet Management (`/dashboard/wallet`):** Simulated card top-ups, bank wire transfers, and transaction ledger.

### 4. Admin Control Room (`/admin`)
* **Access Control:** Restricted strictly to authenticated users with `role: 'admin'`. Hidden from public footers and navigation.
* **Swap Desk:** Inspect vehicle photos, review AI valuation factors, adjust trade-in offers, and advance stages (`submitted` → `valued` → `accepted` → `scheduled` → `completed`).
* **Payments Queue:** Review and approve/reject wallet top-ups with instant ledger credits.
* **Account Management:** Adjust user roles, credit/debit balances, and reset accounts.
* **Market Marking:** Update private equity marks for SpaceX and X Corp with instant real-time portfolio re-valuation.
* **Communications & Broadcasts:** Publish dashboard alert banners and adjust global platform copy.

### 5. Automated Concierge & Security
* **Google SMTP Transactional Mail:** Automated dispatch of swap submissions, cart reservations, OTP verification codes, and sign-in alerts.
* **SEO & Social Graphs:** Dynamic OpenGraph metadata, `robots.txt`, and automated `sitemap.xml`.
* **Global Error Boundaries:** Native Next.js `error.tsx` catching runtime exceptions with clean recovery actions.

---

## 🛠️ Tech Stack & Architecture

```
├── public/                 # Static assets (Vehicle photography, 3D assets, icons)
│   └── images/cars/        # High-res Tesla models (Cybertruck, Model 3/Y/S/X, Semi, Roadster)
├── src/
│   ├── app/                # Next.js App Router (43 static/dynamic routes)
│   │   ├── api/            # Serverless API routes
│   │   │   ├── auth/       # Login, signup, OTP send & verify
│   │   │   ├── markets/    # Finnhub & Yahoo Finance market proxy
│   │   │   ├── valuation/  # Gemini AI vehicle appraisal & 3-layer quota shield
│   │   │   ├── swaps/      # Swap creation & stage updates
│   │   │   ├── payments/   # Top-up approvals
│   │   │   └── seed/       # Day-Zero database seeding endpoint
│   │   ├── lineup/         # Vehicle catalogue & category filters
│   │   ├── swap/           # Interactive 2-step trade-in wizard & photo uploader
│   │   ├── markets/        # Public markets terminal & asset charts
│   │   ├── dashboard/      # Member portal (Overview, Wallet, Portfolio, Showroom)
│   │   └── admin/          # Admin Control Room (Swaps, Users, Payments, Comms)
│   ├── components/         # Reusable UI & specialized components
│   │   ├── PhotoUploader.tsx # Modern drag-and-drop vehicle photo uploader
│   │   ├── Navbar.tsx      # Global header with dynamic auth states
│   │   ├── Footer.tsx      # Customer guarantees & hidden email concierge
│   │   ├── chart.tsx       # Interactive SVG market chart
│   │   └── CarVisual.tsx   # Dual-mode vector blueprints & photography
│   └── lib/                # Core utilities & services
│       ├── db-server.ts    # MongoDB Atlas connection manager & collections
│       ├── valuation.ts    # Black Book automotive depreciation engine
│       ├── valuation-cache.ts # In-memory 24h appraisal cache
│       ├── rate-limit.ts   # In-memory IP rate limiter
│       ├── market-service.ts # Finnhub & Yahoo Finance data aggregation
│       └── email.ts        # Google SMTP mailer with custom HTML templates
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18.18+ or v20+
* **MongoDB**: Atlas connection string or local MongoDB instance
* **Google AI Studio Key**: Free Gemini API Key ([Google AI Studio](https://aistudio.google.com/app/apikey))
* **Finnhub Key**: Free Stock API Key ([Finnhub.io](https://finnhub.io))

### 1. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/teslax?retryWrites=true&w=majority

# Next.js Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication & Session Secret
AUTH_SECRET=your-secure-jwt-secret-key

# Google Gemini AI (Vehicle Appraisals)
GEMINI_API_KEY=your-gemini-api-key

# Finnhub Stock API (TSLA Quotes)
FINNHUB_API_KEY=your-finnhub-api-key
FINNHUB_WEBHOOK_SECRET=your-webhook-secret

# Google SMTP (Email Concierge & OTPs)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
GOOGLE_SMTP_USER=your-email@gmail.com
GOOGLE_SMTP_PASS=your-16-char-app-password
SMTP_FROM="TeslaX Security & Concierge" <your-email@gmail.com>

# Concierge Settings
ADMIN_EMAIL=your-email@gmail.com
CUSTOMER_CARE_EMAIL=your-email@gmail.com
NEXT_PUBLIC_CONCIERGE_PHONE="+1 (937) 532-5145"
NEXT_PUBLIC_CONCIERGE_EMAIL=your-email@gmail.com
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Database (Day-Zero Seed)

To wipe legacy demo accounts and initialize clean official models, settings, and the solitary Superadmin:

```bash
# Start dev server first:
npm run dev

# In another terminal, trigger the seed endpoint:
curl -s "http://localhost:3000/api/seed?target=dayzero-local"
```

> **Default Superadmin:** `muskspacex.teslax@gmail.com`  
> **Password:** `teslax2026!`

---

## 💻 Development & Build Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with Webpack. |
| `npm run build` | Compiles TypeScript and creates optimized production build (`next build --webpack`). |
| `npm run start` | Launches the compiled production server. |
| `npm run lint` | Runs Next.js ESLint checks. |

---

## 🔒 Security Best Practices

1. **Anti-Bot & Quota Protection:** All external API endpoints are shielded against scrapers with invisible honeypots, rate limiting, and 24-hour response caching.
2. **Environment Variables:** Private keys (`GEMINI_API_KEY`, `FINNHUB_API_KEY`, `GOOGLE_SMTP_PASS`, `MONGODB_URI`) are strictly kept in `.env.local` and never committed to version control.
3. **Role-Based Routing:** Admin console routes and control components require server-verified `role === 'admin'` tokens.

---

## 📄 License

Proprietary © TeslaX Platform. All rights reserved.
