# 🌸 BloomCraft Studio — Full-Stack E-Commerce Platform

A production-grade direct-to-consumer (D2C) handmade-gifts e-commerce platform and owner management dashboard built for **BloomCraft Studio** (`@bloomcraftstudio_`), an artisanal boutique founded by Soni in **Jhansi, Uttar Pradesh, India**.

Designed from the ground up to turn discovery and Instagram DM inquiries into a structured shopping experience, bespoke commission workflow, and comprehensive back-office operations.

---

## 🎨 Brand & Design System
- **Aesthetic:** Warm handmade elegance matching the [Storefront UI Mockup](file:///c:/Users/Lenovo/Desktop/BLOOM%20PROJRCT/BloomCraft_Storefront_UI_Mockup.png).
- **Color Palette Tokens:**
  - Plum 900 (`#43243F`): Headings, dark footer, brand title
  - Plum 700 (`#704568`): Primary buttons, key action triggers
  - Rose 600 (`#A64D78`): Accents, selected states, badges
  - Rose 100 (`#F6E4EC`): Soft panels, chip pills
  - Lavender 100 (`#EEE9F7`): Secondary surfaces, callout cards
  - Cream 50 (`#FFFBF8`): Page background
  - Cream 100 (`#F8F0E9`): Product card surfaces
- **Typography:** DM Serif / Playfair Display headings with Inter / DM Sans body text.
- **Mobile-First:** Designed specifically for seamless ordering from mobile Instagram traffic.

---

## ⚡ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **Database:** MongoDB Atlas with Mongoose ODM
- **Media CDN:** Cloudinary (Real cloud storage for admin uploads & customer inspiration screenshots)
- **Authentication:** HttpOnly, SameSite=Lax, Secure session JWTs powered by `jose`
- **Validation:** Strict runtime schema validation using Zod
- **API Architecture:** RESTful `/api/v1` with standardized error envelopes
- **Contract:** OpenAPI 3.1 contract (`packages/contracts/openapi.yaml`)
- **Money Handling:** **Integer Paise** (INR) to eliminate floating-point arithmetic errors.

---

## 🚀 Key Features

### 🛒 1. Customer Storefront
- **Home:** Split hero (*"Little things, made with love."*), category browser, bestsellers showcase, bespoke custom gift banner, trust badges, customer reviews.
- **Shop & Filters:** Browse collections by category (Bouquets, Pots, Keychains, Torans, Accessories), filter by availability (`READY_STOCK` vs `MADE_TO_ORDER`), sort by price or recency, and live search.
- **Product Detail:** High-resolution image gallery, dynamic variant pricing, custom personalisation input fields, handcrafting preparation time estimates, care instructions.
- **Cart & Slide-Over Drawer:** Real-time quantity adjustments, free shipping progress, persistent local storage.
- **Guest Checkout:** Fast checkout without mandatory sign-up; Indian delivery address capture with PIN code verification and state selectors.
- **Real-Time Safe Order Tracking:** Track package status (`/track`) by Order Reference Number + Mobile Number. Internal admin notes and staff details are strictly masked.
- **Custom Order Request Commission:** Dedicated bespoke form (`/custom-order`) capturing occasion, budget range in INR, color palette preferences, description, deadline, and optional inspiration photo upload to Cloudinary.
- **Informational Pages:** About Studio, Contact & WhatsApp, FAQs, Shipping Policy, Returns & Replacements, Privacy Policy, Terms of Service.

### 🛡️ 2. Owner & Admin Dashboard (`/admin`)
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

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v22)
- MongoDB Atlas cluster connection string
- Cloudinary account credentials (free tier works)

### 2. Installation
```bash
# Navigate to the project directory
cd bloomcraft-studio

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env.local` file inside `bloomcraft-studio/` based on `.env.example`:
```env
# MongoDB Atlas Database URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bloomcraft_studio?retryWrites=true&w=majority

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Security
JWT_SECRET=your_secure_random_jwt_secret_32_chars

# Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Seed Database with Realistic Demo Data
Populates categories, products matching the mockup, default store settings, and the admin account:
```bash
npm run seed
```
> **Default Owner Admin Login:**
> - Portal: [http://localhost:3000/admin/login](http://localhost:3000/admin/login) or via the "Studio Owner / Admin" tab on [http://localhost:3000/account/login](http://localhost:3000/account/login)
> - Email: `admin@bloomcraft.in`
> - Password: `admin123`

> **Customer Patron Accounts:**
> - Registration: [http://localhost:3000/account/register](http://localhost:3000/account/register)
> - Sign In: [http://localhost:3000/account/login](http://localhost:3000/account/login)
> - Account Dashboard: [http://localhost:3000/account](http://localhost:3000/account) (view order history, live parcel tracking, saved delivery info)


### 5. Run Automated Tests
Executes unit tests for price calculations, state transitions, Indian address/PIN code validation, and identifier generation:
```bash
npm run test
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to access the owner dashboard.

---

## 📂 Project Directory Structure

```
BLOOM PROJRCT/
├── docs/                                 # Architectural specifications
│   ├── PRD.md                            # Product Requirements Document
│   ├── TDD.md                            # Technical Design Document
│   ├── DATA_DICTIONARY.md                # Database Schema & Field Dictionary
│   ├── API_SPEC.md                       # REST API v1 Specification
│   └── UI_UX_DESIGN_SYSTEM.md            # Brand Colors & Component Patterns
├── packages/
│   └── contracts/
│       └── openapi.yaml                  # OpenAPI 3.1 Specification
├── bloomcraft-studio/
│   ├── src/
│   │   ├── app/                          # Next.js 16 App Router
│   │   │   ├── (storefront pages)        # Home, Shop, Product, Checkout, Track, Custom-Order
│   │   │   ├── admin/                    # Admin Dashboard (Overview, Orders, Products, etc.)
│   │   │   └── api/v1/                   # REST API routes
│   │   ├── components/                   # Storefront & Admin modular UI components
│   │   ├── context/                      # Cart state context & persistence
│   │   ├── lib/                          # DB connection, Cloudinary, Auth JWT, Validations, Utils
│   │   └── models/                       # Mongoose Data Models
│   ├── scripts/
│   │   └── seed.ts                       # Database seeding script
│   └── tests/
│       └── run-tests.ts                  # Automated test runner
├── .env.example                          # Environment variable template
└── README.md
```

