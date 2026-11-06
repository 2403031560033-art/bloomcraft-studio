# 🌸 BloomCraft Studio — Full-Stack E-Commerce Platform

A production-grade direct-to-consumer (D2C) handmade-gifts e-commerce platform and owner management dashboard built for **BloomCraft Studio** (`@bloomcraftstudio_`), an artisanal boutique founded by Soni in **Jhansi, Uttar Pradesh, India**.

Designed from the ground up to turn discovery and Instagram DM inquiries into a structured shopping experience, bespoke commission workflow, and comprehensive back-office operations.

---

## 📂 Repository Structure

The project is structured into clear **Frontend**, **Backend**, **Documentation**, and **API Contracts** directories:

```
BLOOM PROJRCT/
├── frontend/                     # Next.js 16 Storefront & Admin Dashboard
│   ├── src/
│   │   ├── app/                  # Storefront routes & admin portal
│   │   ├── components/           # UI components, layout, and sections
│   │   ├── context/              # Cart & persistence state
│   │   ├── lib/                  # Auth, validations, formatting utilities
│   │   └── models/               # Mongoose ODM schemas
│   ├── public/                   # Static icons & brand assets
│   ├── scripts/seed.ts           # Database seeding script
│   ├── tests/run-tests.ts        # Automated unit & validation test suite
│   ├── .env.example              # Frontend environment variables template
│   └── package.json
│
├── backend/                      # Express.js REST API Server
│   ├── src/
│   │   ├── config/               # MongoDB Atlas connection & Cloudinary setup
│   │   ├── middleware/           # JWT authentication & RBAC guards
│   │   ├── models/               # Mongoose schemas (Products, Orders, Customers, etc.)
│   │   ├── routes/               # Modular REST endpoints (/api/v1/...)
│   │   ├── lib/                  # Business logic, state machines, Zod validations
│   │   └── server.ts             # Express entrypoint on port 5000
│   ├── scripts/seed.ts           # Standalone MongoDB Atlas seeder
│   ├── tests/run-tests.ts        # Automated business rule tests
│   ├── .env.example              # Backend environment variables template
│   └── package.json
│
├── docs/                         # Engineering & Product Documentation
│   ├── PRD.md                    # Product Requirements Document
│   ├── TDD.md                    # Technical Design Document
│   ├── DATA_DICTIONARY.md        # Database Schema & Field Dictionary
│   ├── API_SPEC.md               # REST API Specification
│   └── UI_UX_DESIGN_SYSTEM.md    # Brand Tokens & Component Guidelines
│
├── packages/contracts/
│   └── openapi.yaml              # Complete OpenAPI 3.1 Contract
│
├── .gitignore                    # Secrets & build artifact exclusion
└── README.md                     # Central project guide
```

---

## 🎨 Brand & Design System
- **Aesthetic:** Warm handmade elegance matching the artisanal craft niche.
- **Color Palette Tokens:**
  - Plum 900 (`#43243F`): Primary brand color, headers, dark badges
  - Plum 700 (`#704568`): Primary action buttons, active tabs
  - Rose 600 (`#A64D78`): Accents, highlights, active links
  - Rose 100 (`#F6E4EC`): Soft badge pills, subtle backdrops
  - Lavender 100 (`#EEE9F7`): Callout panels
  - Cream 50 (`#FFFBF8`): Primary page background
  - Cream 100 (`#F8F0E9`): Product gallery surfaces
- **Typography:** DM Serif / Playfair Display headings with Inter / DM Sans body text.
- **Mobile-First:** Tailored for mobile visitors originating from Instagram profile bios.

---

## ⚡ Tech Stack & Architecture

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Lucide Icons
- **Backend:** Express.js + TypeScript + tsx runner
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Cloud Storage:** Cloudinary for image hosting (product galleries & bespoke inspiration photos)
- **Authentication:** Stateless HttpOnly JWT session cookies powered by `jose` (Customer & Studio Owner RBAC)
- **Data Validation:** Runtime validation using Zod
- **API Architecture:** RESTful `/api/v1` with standardized JSON error envelopes
- **API Spec:** OpenAPI 3.1 specification (`packages/contracts/openapi.yaml`)
- **Currency Handling:** **Integer Paise** (INR) to eliminate floating-point arithmetic errors.

---

## 🚀 Key Features

### 🛒 1. Customer Storefront (`frontend/`)
- **Home:** Split hero (*"Little things, made with love."*), category browser, bestsellers showcase, bespoke custom gift banner, trust badges, customer reviews.
- **Shop & Filters:** Browse collections by category (Bouquets, Pots, Keychains, Torans, Accessories), filter by availability (`READY_STOCK` vs `MADE_TO_ORDER`), sort by price or recency, and live search.
- **Product Detail:** High-resolution image gallery, dynamic variant pricing, custom personalisation input fields, handcrafting preparation time estimates, care instructions.
- **Cart & Slide-Over Drawer:** Real-time quantity adjustments, free shipping progress, persistent local storage.
- **Guest Checkout:** Fast checkout without mandatory sign-up; Indian delivery address capture with PIN code verification and state selectors.
- **Real-Time Safe Order Tracking:** Track package status (`/track`) by Order Reference Number + Mobile Number. Internal admin notes and staff details are strictly masked.
- **Custom Order Request Commission:** Dedicated bespoke form (`/custom-order`) capturing occasion, budget range in INR, color palette preferences, description, deadline, and optional inspiration photo upload to Cloudinary.
- **Customer Patron Accounts:** Registration and login (`/account/login`, `/account/register`) with saved shipping addresses and real-time order history.

### 🛡️ 2. Owner & Admin Dashboard (`frontend/admin`)
- **Secure Authentication:** Role-Based Access Control (`OWNER`, `MANAGER`, `FULFILMENT`).
- **Real-Time Overview:** Gross revenue, active in-production queues, pending custom requests, and ready-stock low inventory warnings.
- **Order Management:** View full immutable item snapshots, manage fulfilment states (`PLACED` → `CONFIRMED` → `IN_PRODUCTION` → `READY_TO_DISPATCH` → `SHIPPED` → `DELIVERED`), add courier tracking numbers, and audit every transition.
- **Manual Social-Channel Order Entry:** Record Instagram DM and WhatsApp sales into the central production queue.
- **Custom Requests Inbox:** Review customer inspiration photos, set agreed quotes, record private discussion notes, and convert accepted requests directly into active pipeline orders.
- **Catalogue CRUD:** Create and edit products with direct Cloudinary image uploads, manage stock quantities and lead times, and soft-archive retired items.
- **One-Click CSV Export:** Download complete order history (`/api/v1/admin/reports/orders.csv`) for accounting and logistics.
- **Studio Settings:** Configure brand contacts, flat delivery rates, free shipping threshold, and toggle Cash on Delivery (COD).

---

## 🔒 Crucial Business & Integrity Rules

1. **Server-Side Price Recalculation:** Client totals are strictly ignored at checkout; the server re-queries the database and verifies variant delta prices.
2. **Transactional Inventory Control:** Deducts stock atomically for `READY_STOCK` goods to prevent overselling.
3. **Separation of States:** Fulfilment state machine and Payment state machine operate independently.
4. **Idempotent Webhooks:** Payment webhooks check against unique provider event IDs before executing state transitions.
5. **No Data Fabrication:** Genuine reviews, tax IDs, and carrier agreements are treated as owner-configured placeholders and never fabricated.

---

## 🛠️ Getting Started & Setup

### Prerequisites
- Node.js 18+ (tested on Node.js v22)
- MongoDB Atlas cluster connection string
- Cloudinary account credentials

---

### 🖥️ Option A: Run Full Frontend Application
The Next.js frontend includes complete App Router UI as well as built-in `/api/v1` route handlers:

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Add your MONGODB_URI and Cloudinary credentials

# 3. Seed demo data into MongoDB Atlas
npm run seed

# 4. Run automated test suite (26 tests)
npm test

# 5. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the Storefront or [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Dashboard.

---

### ⚙️ Option B: Run Standalone Backend Server
The dedicated Express server runs on port 5000:

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Add your MONGODB_URI

# 3. Seed database
npm run seed

# 4. Run backend tests
npm test

# 5. Start Express API server
npm run dev
```
Backend API will be running on [http://localhost:5000](http://localhost:5000) (Health check: `/health`).

---

## 🧪 Automated Testing
Both `frontend/` and `backend/` have automated test suites verifying:
1. Paise currency formatting (`₹799`, `₹249.50`)
2. Unique order and custom request ID generation
3. Fulfilment state machine transitions & illegal leap rejections
4. Bespoke inquiry state machine transitions
5. Indian address & PIN code validations (6 digits, proper prefixes)
6. Zod schema integrity

```bash
cd frontend && npm test
cd backend && npm test
```

---

## 📜 Documentation Index
- [Product Requirements Document (PRD)](file:///docs/PRD.md)
- [Technical Design Document (TDD)](file:///docs/TDD.md)
- [Database Schema & Data Dictionary](file:///docs/DATA_DICTIONARY.md)
- [REST API Specification](file:///docs/API_SPEC.md)
- [UI/UX Design System Guide](file:///docs/UI_UX_DESIGN_SYSTEM.md)
- [OpenAPI 3.1 Specification](file:///packages/contracts/openapi.yaml)
