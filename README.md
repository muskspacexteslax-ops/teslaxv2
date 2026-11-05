# TeslaX — Next.js + Tailwind CSS

A high-performance web platform for trading petrol vehicles for Teslas, managing trade-in valuations, vehicle leases, wallet balances, and private market tracking (TSLA, SpaceX, X).

Converted from Hono JSX views to a modern **Next.js (App Router)** and **Tailwind CSS** application with full client-side state management, interactive components, and administration tools.

---

## Architecture Overview

```
├── public/                 # Static assets (Vehicle photography, 3D assets, icons)
│   └── images/cars/        # High-resolution Tesla imagery (Cybertruck, Model 3, Y, S, Semi, Roadster)
├── src/
│   ├── app/                # Next.js App Router routes
│   │   ├── layout.tsx      # Root layout with TeslaXProvider & ToastContainer
│   │   ├── page.tsx        # Homepage (Hero, ticker ribbon, how it works, lineup showcase)
│   │   ├── lineup/         # Vehicle catalogue with live category filters & search
│   │   │   ├── page.tsx
│   │   │   └── [slug]/     # Interactive model detail & valuation entrypoint
│   │   ├── swap/           # 2-step trade-in valuation wizard & financing calculator
│   │   │   └── page.tsx
│   │   ├── markets/        # Public interactive markets (TSLA NASDAQ feed, SpaceX & X marks)
│   │   │   └── page.tsx
│   │   ├── login/          # Member authentication with instant demo role switcher
│   │   │   └── page.tsx
│   │   ├── signup/         # Account registration flow
│   │   │   └── page.tsx
│   │   ├── verify/         # 6-digit email verification with demo autofill
│   │   │   └── page.tsx
│   │   ├── dashboard/      # Member Portal Shell
│   │   │   ├── page.tsx    # Member Overview (KPIs, active swap progress, market watch)
│   │   │   ├── swaps/      # Swap timeline history & detailed progress tracker
│   │   │   ├── showroom/   # Applied trade-in credit vehicle reservation catalogue
│   │   │   ├── markets/    # Trading desk with interactive charts & order ticket
│   │   │   ├── portfolio/  # Real-time position value, cost basis, unrealised P/L
│   │   │   ├── wallet/     # Balance management, simulated card top-up & bank transfers
│   │   │   └── profile/    # Contact info & vehicle delivery address
│   │   └── admin/          # Control Room (Administration Console)
│   │       ├── page.tsx    # Admin Overview (Platform health, KPIs, pending payments)
│   │       ├── swaps/      # Valuation desk & binding offer stage manager
│   │       ├── payments/   # Wallet top-up approval/rejection queue
│   │       ├── users/      # Member account management & wallet credit/debit adjuster
│   │       ├── markets/    # Private valuation mark repricing & model sizing values
│   │       └── comms/      # Dashboard announcement publisher & platform copy editor
│   ├── components/         # Reusable UI & specialized components
│   │   ├── Navbar.tsx      # Global sticky navbar with interactive role switcher
│   │   ├── Footer.tsx      # Footer with brand, disclosures, and navigation
│   │   ├── CarVisual.tsx   # Dual-mode vehicle rendering (real photo + vector blueprint)
│   │   ├── chart.tsx       # Interactive SVG stock chart with timeframes (1D, 1W, 1M, 1Y, ALL)
│   │   ├── PlanBox.tsx     # Monthly settlement calculator with flexible terms (12-60 mo)
│   │   ├── PhotoUploader.tsx # Drag-and-drop vehicle photo uploader with preview
│   │   ├── dashboard.tsx   # DashShell, Ico icons, and SwapPill badges
│   │   ├── AdminShell.tsx  # Admin control room tabs & layout
│   │   └── ui.tsx          # Alert, Empty, Raw, Brand, and Mark components
│   ├── context/
│   │   └── TeslaXContext.tsx # Centralised state management, ledger, orders, and persistent storage
│   ├── data/
│   │   └── models.ts       # Vehicle specifications, pricing, and inline SVG generators
│   └── lib/
│       ├── db.ts           # Core TypeScript interfaces, formatters (money, dates), and status constants
│       ├── valuation.ts    # Algorithmic trade-in valuation engine based on age, mileage, condition
│       ├── plan.ts         # Financing and settlement interest math
│       └── market.ts       # Market series path generation and quote calculations
└── original_hono_views/    # Preserved original template source files for reference
```

---

## Getting Started

### 1. Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Production Build

To compile TypeScript and build optimized static/dynamic routes:

```bash
npm run build
```

Then start the production server:

```bash
npm run start
```

---

## Key Features

1. **Trade-in Valuation Engine (`/swap`)**:
   - Takes vehicle make, model, year, mileage, condition, service history, accident history, and photo.
   - Calculates indicative valuation with itemised factor breakdown ("What moved the number").
   - Interactive financing plan selector (terms from 12 to 60 months with 0% APR indications).

2. **Vehicle Catalogue (`/lineup` & `/dashboard/showroom`)**:
   - Compares market price against internal TeslaX swap value.
   - Categorised filters: Sedans, SUVs, Pickup (Cybertruck), Roadster, Commercial (Semi).
   - Instant reservation against member trade-in credits.

3. **Trading Desk & Portfolio (`/dashboard/markets` & `/dashboard/portfolio`)**:
   - Real-time SVG chart with interactive timeframe tabs and crosshairs.
   - Paper trading execution for TSLA, SpaceX (SPCX), and X Corp (X).
   - Real-time ledger entries, P/L percentage updates, and average cost calculations.

4. **Control Room Admin Console (`/admin`)**:
   - Review pending swaps, adjust binding offers, and advance swap stages (`submitted` → `valued` → `accepted` → `scheduled` → `completed`).
   - Confirm or reject member top-ups (instantly credits member wallet).
   - Re-price private valuation marks for SpaceX and X (instant re-valuation of all member portfolios).
   - Publish dashboard notices and adjust platform copy.

5. **Demo Role Switcher**:
   - Directly available in the top right of the navigation bar: easily toggle between **Member** (`Ada Okafor`), **Admin** (`Control Room`), and **Guest** view.

