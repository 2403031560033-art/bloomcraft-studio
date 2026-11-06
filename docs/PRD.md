# BLOOMCRAFT STUDIO — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Version:** 1.0  
**Date:** 05 November 2026  
**Initial Market:** Jhansi, India  
**Based on:** Supplied Instagram Profile Reference (`@bloomcraftstudio_`)

---

## Important Assumptions & Integrity Notice
The Instagram screenshots support the brand name, studio location (Jhansi, India), and visible handmade craft categories (crochet bouquets, flower pots, floral keychains, torans/wall hangings, hair accessories, and custom gifts). They do not establish actual inventory counts, legal business details, fixed shipping tariffs, or genuine customer reviews. These remain business-owner decisions. Placeholders are clearly marked and never fabricated.

---

## 1. Product Vision
Create a branded direct-to-customer storefront for BloomCraft Studio that turns Instagram discovery and DM enquiries into structured product browsing, custom-order requests, checkout and order tracking. Include a secure owner dashboard to manage products, requests, orders, payments and fulfilment.

---

## 2. Evidence from Supplied Instagram Screenshots
- **Handle:** `@bloomcraftstudio_`
- **Profile Name:** Soni
- **Location:** Jhansi, Uttar Pradesh, India
- **Positioning:** Handmade crafts, custom gifts, eternal blooms
- **Visible Product Types:**
  - Handcrafted Bouquets (roses, lavender, mixed blooms)
  - Flower Pots (crochet sunflower pots, mini desk planters)
  - Keychains (twin flower charms, crochet accessories)
  - Torans & Wall Hangings (festive Shubh-Laabh torans, floral doorway decor)
  - Hair Accessories (floral clips, barrettes)
  - Personalised / Custom Gifts
- **Current Ordering Mechanism:** DM to order on Instagram with manual payment coordination.

---

## 3. User Personas
1. **Shopper / Gift Buyer:**
   - Discovers BloomCraft via Instagram or word-of-mouth.
   - Browses handmade gifts by category, price, and availability.
   - Selects personalized options (custom greeting card tags, ribbon colors).
   - Completes guest checkout without mandatory account registration.
   - Safely tracks production and delivery progress.
2. **Business Owner (Soni):**
   - Manages catalogue, pricing, and variant availability.
   - Reviews bespoke custom requests, calculates quotes, and communicates timelines.
   - Converts approved custom quotes into real pipeline orders.
   - Records manual social-channel orders (Instagram DMs, WhatsApp sales).
   - Updates order states (In Production -> Ready to Dispatch -> Shipped with tracking).
3. **Fulfilment Helper (Future):**
   - Role-restricted access to view assigned orders and update packaging/dispatch.

---

## 4. Goals and Success Metrics
- **DM Friction Reduction:** Minimize time spent repeatedly explaining pricing and taking addresses manually over chat.
- **Order Details Capture:** Capture complete customisation notes, delivery PIN code, and recipient names upfront.
- **Centralised Visibility:** Consolidate website orders and social DM orders into one real-time admin queue.
- **Key Metrics to Track:**
  - Product page views and Add-to-Basket conversion.
  - Custom gift inquiry submissions and inquiry-to-order conversion rate.
  - Production cycle time (dispatch within 2-4 days).
  - Repeat purchase rate.

---

## 5. Scope

### Storefront (MVP)
- **Home:** Split Hero ("Little things, made with love."), Shop by Category grid, Bestsellers row, Bespoke Gift highlight banner, Trust Badges, Customer Feedback placeholders, Brand Footer.
- **Shop / Catalogue:** Filters by category, availability (Ready Stock vs Made to Order), price range, search query, sorting.
- **Product Detail:** Photo gallery, dynamic price recalculation per variant, fulfilment badges, prep time estimates, custom personalisation input fields, care instructions.
- **Basket Drawer & Guest Checkout:** Slide-over cart, Indian address capture (PIN code, state dropdown, mobile number), server price recalculation, order summary.
- **Safe Order Tracking:** Lookup by Order Reference Number + customer phone; safe timeline omitting internal notes.
- **Custom Order Inquiry Form:** Occasion selector, budget range, color palette tags, detailed description, inspiration photo upload (Cloudinary).
- **Informational Pages:** About Studio, Contact & WhatsApp, FAQs, Shipping Policy, Returns & Replacements, Privacy Policy, Terms of Service.

### Admin Dashboard (MVP)
- Secure session login with role-based access control (RBAC).
- Actionable Overview KPI metrics (Revenue, In Production, Inquiries, Low Stock alerts).
- Order Management with valid state machine transitions and audit history.
- Manual order entry for Instagram & WhatsApp DM orders.
- Custom Requests Inbox with quote submission and "Convert to Order" workflow.
- Product & Category CRUD with real Cloudinary image uploads.
- One-click CSV Export of all orders.
- Store Settings (policies, shipping fees, COD enablement).

---

## 6. Functional Requirements Matrix
- **FR01:** Public Category/Product Catalogue (P0)
- **FR02:** Product Detail, Gallery, Variants, and Availability (P0)
- **FR03:** Cart Operations (P0)
- **FR04:** Guest Checkout and Indian Address Capture (P0)
- **FR05:** Server-Priced Order Creation with Immutable Item Snapshots (P0)
- **FR06:** Configurable Payment Methods & Verified Payment Updates (P0)
- **FR07:** Custom Request Submission with Cloudinary Image Upload (P0)
- **FR08:** Admin Authentication & RBAC (P0)
- **FR09:** Catalogue Management & Cloud Image Uploads (P0)
- **FR10:** Order & Custom Request Queue Management (P0)
- **FR11:** Append-Only Order Status Audit History (P0)
- **FR12:** Manual Social-Channel Order Entry (P1)
- **FR13:** CSV Export for Orders (P1)
