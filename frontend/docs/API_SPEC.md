# BLOOMCRAFT STUDIO — REST API SPECIFICATION

**Base Path:** `/api/v1`  
**Data Format:** JSON  
**Money Convention:** Integer paise (`currency: "INR"`)  
**Standard Error Envelope:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable explanation",
    "details": []
  }
}
```

---

## 1. Public Endpoints

### `GET /api/v1/categories`
Returns all active categories sorted by display order.
- **Response (200):** `{ success: true, data: [Category] }`

### `GET /api/v1/products`
Returns published catalogue items with filtering and search.
- **Query Parameters:**
  - `category` (string, slug)
  - `q` (string, search term)
  - `minPrice` / `maxPrice` (numbers in rupees)
  - `availability` (`READY_STOCK` | `MADE_TO_ORDER`)
  - `sort` (`newest` | `price-asc` | `price-desc` | `name-asc`)
  - `page` (number, default 1)
  - `limit` (number, default 24)
- **Response (200):** `{ success: true, data: [Product], pagination: { total, page, pages } }`

### `GET /api/v1/products/{slug}`
Returns complete product details, variants, and personalisation schema by slug.
- **Response (200):** `{ success: true, data: Product }`
- **Response (404):** Product not found or unpublished.

### `POST /api/v1/checkout`
Submits guest checkout. Server re-verifies stock, recalculates prices, and creates immutable order and payment reference.
- **Request Body:**
  ```json
  {
    "customerName": "Riya Sharma",
    "customerPhone": "9876543210",
    "customerEmail": "riya@example.com",
    "customerNote": "Please add birthday greeting card",
    "shippingAddress": {
      "recipientName": "Riya Sharma",
      "phoneE164": "9876543210",
      "addressLine1": "142 Civil Lines",
      "city": "Jhansi",
      "state": "Uttar Pradesh",
      "postalCode": "284001",
      "countryCode": "IN"
    },
    "items": [
      {
        "productId": "654321654321654321654321",
        "quantity": 1,
        "personalisation": { "tagMessage": "Happy Birthday!" }
      }
    ],
    "paymentMethod": "ONLINE"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      "orderNumber": "BC2611054321",
      "orderStatus": "PENDING_PAYMENT",
      "paymentStatus": "UNPAID",
      "totalPaise": 79900,
      "paymentCheckoutReference": { ... }
    }
  }
  ```

### `GET /api/v1/orders/track?orderNumber={BC...}&phone={...}`
Returns public sanitized tracking timeline. Internal notes and staff details are strictly excluded.
- **Response (200):** `{ success: true, data: { orderNumber, orderStatus, timeline, items, deliveryCity, trackingCarrier, trackingNumber } }`

### `POST /api/v1/custom-order-requests`
Submits bespoke commission inquiry with optional Cloudinary inspiration photo.
- **Response (201):** `{ success: true, data: { requestNumber, status: "SUBMITTED", message } }`

---

## 2. Admin Endpoints (Require HttpOnly Session)

### `POST /api/v1/admin/auth/login`
Authenticates admin with bcrypt check; sets HttpOnly JWT cookie.

### `POST /api/v1/admin/auth/logout`
Clears session cookie.

### `GET /api/v1/admin/me`
Returns current admin name and role.

### `GET /api/v1/admin/orders`
Paginated orders list with status, source, and search filters.

### `POST /api/v1/admin/orders`
Records manual order from Instagram / WhatsApp DMs.

### `GET /api/v1/admin/orders/{id}`
Returns order details and audit status history.

### `PATCH /api/v1/admin/orders/{id}`
Transitions order state (`PLACED` -> `CONFIRMED` -> `IN_PRODUCTION` -> `READY_TO_DISPATCH` -> `SHIPPED` -> `DELIVERED`), updates courier tracking info, and appends audit log.

### `GET /api/v1/admin/custom-requests`
Lists custom requests queue.

### `PATCH /api/v1/admin/custom-requests/{id}`
Updates status, sets quote price, and saves internal notes.

### `POST /api/v1/admin/custom-requests/{id}/convert-to-order`
Converts accepted custom request into an active production order.

### `GET /api/v1/admin/reports/summary`
Returns KPI metrics (gross revenue, active in production, pending inquiries, low stock).

### `GET /api/v1/admin/reports/orders.csv`
Streams CSV export of all orders.

### `POST /api/v1/upload`
Uploads multipart image file to Cloudinary and returns secure CDN URL.

---

## 3. Customer Authentication & Profile Endpoints

### `POST /api/v1/auth/register`
Creates a customer patron account (name, phone, email, password) with bcrypt hashing; sets `bloomcraft_customer_session` HttpOnly JWT cookie.

### `POST /api/v1/auth/login`
Authenticates customer patron via email or phone; sets `bloomcraft_customer_session` HttpOnly JWT cookie.

### `POST /api/v1/auth/logout`
Clears customer session cookie.

### `GET /api/v1/auth/me`
Unified auth check endpoint. Detects whether the current session is an authenticated `CUSTOMER`, `ADMIN`, or guest `null`.

### `GET /api/v1/customer/orders`
Retrieves authenticated customer's order history, active order statuses, and live courier tracking links.


