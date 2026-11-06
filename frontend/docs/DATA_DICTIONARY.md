# BLOOMCRAFT STUDIO — DATA DICTIONARY

**Database Engine:** MongoDB Atlas (Mongoose ODM)  
**Convention:** All monetary amounts are stored in **Integer Paise** (INR $\times$ 100) to eliminate IEEE 754 floating-point inaccuracies. Timestamps are ISO 8601 UTC.

---

## 1. `categories` Collection
Stores product categories displayed in navigation and filter sidebars.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique category primary key |
| `name` | String(80) | Yes | Category display title (e.g. "Bouquets") |
| `slug` | String(100) | Yes | URL slug (e.g. "bouquets"), indexed unique |
| `description`| String | No | Category introduction text |
| `imageUrl` | String | No | Category thumbnail photo URL |
| `sortOrder` | Number | Yes | Integer display order (default 0) |
| `isActive` | Boolean | Yes | Publication status flag |
| `createdAt` | Date | Yes | Creation timestamp |
| `updatedAt` | Date | Yes | Last modified timestamp |

---

## 2. `products` Collection
Main inventory catalogue of handmade goods.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Product primary key |
| `categoryId` | ObjectId | Yes | Reference to `categories._id` |
| `name` | String(160)| Yes | Full product title |
| `slug` | String | Yes | Unique SEO slug |
| `sku` | String | No | Stock Keeping Unit |
| `shortDescription` | String(300)| No | Summary line |
| `description` | String | No | Full markdown product details |
| `basePricePaise`| Number | Yes | Base price in integer paise (e.g. 79900 for ₹799) |
| `currency` | String(3) | Yes | Currency code (default `INR`) |
| `fulfilmentType`| Enum | Yes | `READY_STOCK` \| `MADE_TO_ORDER` \| `CUSTOM_ONLY` |
| `stockQuantity` | Number | No | Available units for `READY_STOCK` items |
| `preparationMinDays`| Number | No | Minimum crafting days for `MADE_TO_ORDER` |
| `preparationMaxDays`| Number | No | Maximum crafting days for `MADE_TO_ORDER` |
| `isPublished` | Boolean | Yes | Public catalogue visibility toggle |
| `archivedAt` | Date | No | Timestamp of soft-deletion/archival |
| `images` | Array | Yes | Array of `{ imageUrl, publicId, altText, isPrimary }` |
| `variants` | Array | Yes | Array of `{ name, sku, priceDeltaPaise, stockQuantity }` |
| `personalisationFields`| Array | Yes | Array of `{ fieldName, label, placeholder, required }` |
| `careInstructions` | String | No | Handmade preservation guidelines |
| `tags` | Array[String]| Yes| Search and filter keywords |

---

## 3. `orders` Collection
Order records with immutable customer and item snapshots.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique order ID |
| `orderNumber` | String | Yes | Unique tracking reference (e.g. `BC2611054321`) |
| `customerId` | ObjectId | No | Reference to customer document |
| `source` | Enum | Yes | `WEBSITE` \| `INSTAGRAM` \| `WHATSAPP` \| `MANUAL` |
| `orderStatus` | Enum | Yes | `PENDING_PAYMENT`, `PLACED`, `CONFIRMED`, `IN_PRODUCTION`, `READY_TO_DISPATCH`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `ON_HOLD` |
| `paymentStatus` | Enum | Yes | `UNPAID`, `PENDING`, `PAID`, `FAILED`, `COD_DUE` |
| `subtotalPaise` | Number | Yes | Recalculated items total in paise |
| `shippingPaise` | Number | Yes | Shipping cost in paise |
| `discountPaise` | Number | Yes | Discount in paise |
| `totalPaise` | Number | Yes | Final payable amount in paise |
| `shippingAddressSnapshot`| Object | Yes | Immutable address `{ recipientName, phoneE164, addressLine1, city, state, postalCode }` |
| `customerNameSnapshot`| String | Yes | Name captured at checkout |
| `customerPhoneSnapshot`| String | Yes | Phone captured at checkout |
| `items` | Array | Yes | Immutable item snapshots `{ productNameSnapshot, unitPricePaise, quantity, lineTotalPaise, personalisation }` |
| `statusHistory` | Array | Yes | Audit log `{ fromStatus, toStatus, note, actorAdminId, createdAt }` |
| `trackingCarrier`| String | No | Courier name (e.g. Delhivery) |
| `trackingNumber` | String | No | Waybill / AWB tracking number |

---

## 4. `customorderrequests` Collection
Custom gift inquiries submitted by shoppers.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique request ID |
| `requestNumber` | String | Yes | Unique request code (e.g. `CR26111234`) |
| `customerName` | String | Yes | Customer name |
| `phoneE164` | String | Yes | Indian contact mobile |
| `email` | String | No | Customer email |
| `occasion` | String | No | Birthday, Anniversary, Wedding, etc. |
| `budgetMinPaise` | Number | No | Minimum budget in paise |
| `budgetMaxPaise` | Number | No | Maximum budget in paise |
| `preferredColours`| Array[String]| Yes| Selected color palette |
| `description` | String | Yes | Customer's gift description |
| `inspirationImageUrl`| String | No | Cloudinary URL of uploaded screenshot |
| `requiredBy` | Date | No | Desired delivery deadline |
| `status` | Enum | Yes | `SUBMITTED`, `UNDER_REVIEW`, `NEEDS_INFORMATION`, `QUOTED`, `ACCEPTED`, `DECLINED`, `CLOSED`, `CONVERTED` |
| `quotePaise` | Number | No | Owner's quoted price in paise |
| `adminNotes` | String | No | Internal studio discussion notes |
| `convertedOrderId` | ObjectId | No | Reference to created `orders._id` |

---

## 5. `adminusers` Collection
Staff and owner accounts.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Unique admin ID |
| `name` | String | Yes | Staff member name |
| `email` | String | Yes | Unique login email |
| `passwordHash` | String | Yes | Bcrypt password hash |
| `role` | Enum | Yes | `OWNER` \| `MANAGER` \| `FULFILMENT` |
| `isActive` | Boolean | Yes | Account status |
| `lastLoginAt` | Date | No | Timestamp of most recent sign-in |

---

## 6. `businesssettings` Collection
Global configuration, policies, and contact details.

| Field | Type | Required | Description |
|---|---|---|---|
| `businessName` | String | Yes | "BloomCraft Studio" |
| `supportEmail` | String | No | Studio email |
| `supportPhone` | String | No | Contact phone |
| `instagramUrl` | String | Yes | `https://www.instagram.com/bloomcraftstudio_` |
| `whatsappUrl` | String | No | Direct WhatsApp link |
| `isCodEnabled` | Boolean | Yes | Cash on Delivery toggle |
| `flatShippingRatePaise` | Number | Yes | Flat shipping charge in paise |
| `freeShippingAbovePaise`| Number | No | Free delivery threshold |

