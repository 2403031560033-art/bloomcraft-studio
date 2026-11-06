# BLOOMCRAFT STUDIO — TECHNICAL DESIGN DOCUMENT (TDD)

**Version:** 1.0  
**Architecture:** Next.js 16 (App Router) + TypeScript Modular Monolith  
**Database:** MongoDB Atlas (Mongoose ODM)  
**Media Storage:** Cloudinary CDN  

---

## 1. System Architecture & Topology

```
┌────────────────────────────────────────────────────────┐
│                   Customer Browser                     │
│         (Mobile First / Responsive Storefront)         │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│               Next.js 16 Application Server            │
│  - App Router: Storefront Pages & Admin Dashboard      │
│  - API Routes: /api/v1/*                               │
│  - Zod Input Validation & Business State Machines      │
│  - Jose JWT HttpOnly Cookie Session Auth               │
└──────────────┬─────────────────────────┬───────────────┘
               │                         │
               ▼                         ▼
┌───────────────────────────────┐ ┌──────────────────────┐
│     MongoDB Atlas Cluster     │ │    Cloudinary CDN    │
│  - 8 Data Collections         │ │  - Product Images    │
│  - Strict Indexes & Schemas   │ │  - Inspiration Photos│
│  - Transactional Stock Updates│ └──────────────────────┘
└───────────────────────────────┘
```

---

## 2. Key Modules & Separation of Concerns

1. **Authentication & RBAC (`src/lib/auth.ts`):**
   - Implements JWT session signing using `jose` with HS256 algorithm.
   - HttpOnly, SameSite=Lax, Secure cookie storage.
   - Three hierarchical roles: `OWNER` (3) > `MANAGER` (2) > `FULFILMENT` (1).
2. **Database & Connection Pooling (`src/lib/db.ts`):**
   - Cached Mongoose connection across serverless / edge runtime invocations.
3. **Media Storage Adapter (`src/lib/cloudinary.ts`):**
   - Cloudinary upload stream integration for admin catalog photos and user inspiration screenshots.
4. **Checkout & Order Pricing Engine (`src/app/api/v1/checkout/route.ts`):**
   - **Never trusts client-submitted prices or totals.**
   - Server re-queries active database prices and recalculates:
     $$\text{Line Total} = (\text{Base Price} + \Delta\text{Variant Price}) \times \text{Quantity}$$
     $$\text{Subtotal} = \sum \text{Line Totals}$$
     $$\text{Total} = \text{Subtotal} + \text{Shipping} - \text{Discount}$$
   - Atomically deducts inventory for `READY_STOCK` items.
   - Generates immutable snapshots of product name, SKU, unit price, variant, and personalisation.
5. **State Machines & Transitions (`src/lib/utils.ts`):**
   - Fulfilment and Payment state machines are stored and updated independently.
   - Fulfilment State Machine:
     `PENDING_PAYMENT` $\rightarrow$ `PLACED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `IN_PRODUCTION` $\rightarrow$ `READY_TO_DISPATCH` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.
     Exceptions: `ON_HOLD`, `CANCELLED`, `PAYMENT_FAILED`, `REFUND_PENDING`, `REFUNDED`.
   - Payment State Machine:
     `UNPAID`, `PENDING`, `PAID`, `FAILED`, `PARTIALLY_REFUNDED`, `REFUNDED`, `COD_DUE`.
   - Transitions are strictly validated; invalid status jumps return HTTP 422.
   - Every transition appends an audit record to `order.statusHistory` with timestamp and `actorAdminId`.

---

## 3. Security & Integrity Safeguards

- **No Data Exposure on Tracking:**
  Public order tracking (`/api/v1/orders/track`) strips all internal studio notes, staff identities, and other customer data, exposing only a sanitized production timeline and delivery city/state.
- **Webhook Idempotency & Signature Verification:**
  `/api/v1/webhooks/payments/[provider]` verifies HMAC-SHA256 signatures against the raw payload and stores unique provider event IDs to prevent replay attacks or duplicate captures.
- **Input Sanitization:**
  All endpoints validate payloads with strict Zod schemas with regex constraints for Indian 10-digit mobile numbers and 6-digit PIN codes.
