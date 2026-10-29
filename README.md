# Aeromach — Aerospace & Aviation Technical Apparel Lab

[![CI](https://github.com/umar-masood3/aeromach-website/actions/workflows/ci.yml/badge.svg)](https://github.com/umar-masood3/aeromach-website/actions/workflows/ci.yml)

Aeromach is an independent e-commerce brand engineered for aerospace engineers, aviation professionals, fluid mechanics researchers, pilots, and minimalist technical streetwear enthusiasts.

Built from first principles: Precision CAD line-art, aerodynamic vector equilibrium, and supersonic fluid dynamics translated into minimal, high-density apparel with server-authoritative checkout and Printify on-demand fulfillment.

---

## Technical Architecture & Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React Server Components, TypeScript Strict Mode).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom aerospace aesthetic (graphite surfaces, CAD gridlines, cockpit amber, afterburner orange, and avionics cyan accents).
- **Relational Persistence**: [Prisma ORM](https://www.prisma.io/) with SQLite (`aeromach.db`) for zero-configuration, durable ACID transactional integrity. Ready for zero-code migration to PostgreSQL or Cloud SQL by setting `provider = "postgresql"` in `prisma/schema.prisma`.
- **Payment Gateway**: [Razorpay](https://razorpay.com/) integration featuring server-side HMAC-SHA256 cryptographic signature verification and webhook deduplication. Seamless test simulator mode for zero-credential development.
- **On-Demand Fulfillment**: Official [Printify REST API v1](https://developers.printify.com/) client with durable outbox queueing, variant ID mapping, exponential backoff, ambiguous timeout reconciliation, and sandbox mock adapter.
- **Testing**: [Vitest](https://vitest.dev/) automated unit and end-to-end integration test suite.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.x or 20.x
- npm 9+

### 2. Environment Setup
The project includes a pre-configured `.env` for immediate local development and sandbox simulation:
```bash
# Clone or open workspace
cd "d:\Umar\Aeromach website"

# (Optional) Review environment configuration
cp .env.example .env
```

### 3. Initialize Database & Seed Products
```bash
# Push Prisma schema to SQLite database (aeromach.db)
npx prisma db push

# Seed 6 verified aerospace apparel models and CAD vector art
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```

---

## Routes & Pages

### Storefront
- `/`: Atmospheric homepage with CAD schematics, category highlights, and design manifesto.
- `/collection`: Complete catalog with real-time filtering (Schematic, Principle, Culture), sorting, and search.
- `/products/[slug]`: Deep product inspection with multi-frame image preview, size and colorway selection, dynamic pricing, live delivery estimator, and technical specifications.
- `/cart`: Full cargo manifest with item quantity adjustments and free shipping threshold meter.
- `/checkout`: Multi-step delivery destination form with server-authoritative pricing calculation, Razorpay gateway initiation, and sandbox test simulator.
- `/order/[token]`: Secure public customer order tracking portal with separate payment vs. fulfillment milestones, carrier waybill details, and support actions.
- `/tracking`: Public search portal to look up any order by reference number and customer email.

### Operational Governance & Policies
- `/about`: Aeromach brand story, CAD drafting origins, and on-demand sustainability.
- `/size-guide`: Comprehensive size charts for Bella+Canvas 3001 tees and Gildan 18500 hoodies in both inches and centimeters.
- `/shipping-policy`: Transparent production windows, domestic express shipping, and international air dispatch terms.
- `/returns`: Print-on-demand policy with 100% replacement guarantee for misprints and manufacturing flaws.
- `/faq`: Interactive technical knowledge base.
- `/contact`: Direct communication channel with the Bengaluru flight lab.
- `/privacy` & `/terms`: Complete legal documentation and PCI-DSS compliance disclosures.

### Founder / Administrative Operations
- `/admin`: Restricted operational terminal protected by `ADMIN_SECRET_KEY`.
  - Live revenue, order volume, and fulfillment state metrics.
  - Separate inspection of payment status vs. fulfillment status.
  - Manual retry action for failed Printify fulfillment jobs.
  - Status reconciliation against Printify API.
  - Printify catalog synchronization.
  - Real-time audit log of all system and webhook activities.

---

## Order Lifecycle & Resilience

Aeromach enforces strict separation between customer payment and external manufacturing fulfillment:

```
[Customer Checkout]
        │
        ▼
[Server-Authoritative Price Calculation] (Never trusts client prices)
        │
        ▼
[Razorpay Gateway Order Created] (Status: PENDING)
        │
        ▼
[Payment Signature Verified via HMAC-SHA256] ──► (Status: PAID)
        │
        ▼
[Durable Fulfillment Outbox Enqueued] (Job Status: PENDING)
        │
        ▼
[Official Printify API Order Submission]
   ├── Success ──► (Status: SUBMITTED_TO_PRINTIFY ──► AWAITING_PRODUCTION)
   └── Failure ──► (Status: SUBMISSION_FAILED, Error Logged, Admin Alerted)
                    * Crucial: Paid order is NEVER erased! Recoverable in Admin.
```

---

## Production Deployment Checklist

When deploying to production (e.g. Vercel, Render, Railway, VPS):

1. **Database**: Point `DATABASE_URL` to a persistent database (PostgreSQL or Turso/SQLite).
2. **Razorpay Live Credentials**:
   - Obtain Live Key ID and Secret from [Razorpay Dashboard](https://dashboard.razorpay.com/).
   - Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - Configure Webhook URL `https://your-domain.com/api/webhooks/razorpay` and set `RAZORPAY_WEBHOOK_SECRET`.
3. **Printify Live Credentials**:
   - Generate a Personal Access Token from [Printify API settings](https://printify.com/app/account/api).
   - Set `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID`.
   - Configure Webhook URL `https://your-domain.com/api/webhooks/printify`.
4. **Sandbox Simulator**:
   - Leave `ENABLE_TEST_PAYMENT_SIMULATOR="false"` (the default in `.env.example`).
   - This is only a secondary switch. The simulator is hard-blocked whenever
     `NODE_ENV` is not exactly `development` or `test`, so `production`,
     `staging` and preview deployments cannot reach the endpoint at all, and
     the checkout page shows a "checkout disabled" notice instead of a pay
     button when no gateway is configured.
   - Set a strong, random `ADMIN_SECRET_KEY`.

