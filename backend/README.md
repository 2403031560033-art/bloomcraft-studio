# BloomCraft Studio — Backend Server

Express.js REST API backend for the **BloomCraft Studio** artisanal D2C e-commerce platform.

## 🚀 Features

- **Express 4 + TypeScript & tsx:** High-performance, type-safe API server.
- **MongoDB Atlas Integration:** Full Mongoose ODM models with transactional integrity.
- **Authentication & RBAC:**
  - Customer Patron sessions (`bloomcraft_customer_session`).
  - Studio Owner & Manager RBAC sessions (`bloomcraft_admin_session`).
  - Stateless JWT token signing with `jose`.
- **Catalogue & Pricing Engine:**
  - Integer paise representation (`INR`) with strict zero-float rounding error guarantee.
  - Server-side price recalculation at checkout (client prices ignored).
  - Atomic stock deductions for `READY_STOCK` items.
- **Custom Commission Order Queue:** Full status machine (`SUBMITTED` → `QUOTED` → `ACCEPTED` → `CONVERTED`).
- **Cloudinary CDN Integration:** Multipart file uploads for inspiration images and products.
- **Reporting:** Order history CSV stream and real-time studio KPIs.
- **Payment Webhook Idempotency:** Event ID caching to prevent duplicate transitions.

## 🛠️ Quick Start

### 1. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `MONGODB_URI` points to your MongoDB Atlas cluster.

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Automated Tests
```bash
npm test
```

### 5. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```
The server will start at `http://localhost:5000`.

## 📚 API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `POST` | `/api/v1/auth/register` | Customer registration |
| `POST` | `/api/v1/auth/login` | Customer login |
| `POST` | `/api/v1/auth/logout` | Customer logout |
| `GET` | `/api/v1/auth/me` | Current session check |
| `GET` | `/api/v1/products` | Public product catalogue |
| `GET` | `/api/v1/products/:slug` | Product details by slug |
| `GET` | `/api/v1/categories` | Active categories |
| `POST` | `/api/v1/checkout` | Secure server-calculated checkout |
| `GET` | `/api/v1/orders/track` | Public sanitized order tracking |
| `POST` | `/api/v1/custom-order-requests` | Submit custom commission |
| `POST` | `/api/v1/admin/auth/login` | Studio owner login |
| `GET` | `/api/v1/admin/orders` | Admin orders list |
| `PATCH` | `/api/v1/admin/orders/:id` | Order status transition |
| `GET` | `/api/v1/admin/reports/summary` | KPI overview metrics |
| `GET` | `/api/v1/admin/reports/orders.csv` | Orders CSV export |
