/**
 * BloomCraft Studio Automated Test Suite
 * Validates business rules, state machines, price calculations, and validations
 */

import {
  formatPaise,
  generateOrderNumber,
  generateRequestNumber,
  isValidTransition,
  VALID_ORDER_TRANSITIONS,
  VALID_CUSTOM_REQUEST_TRANSITIONS,
} from "../src/lib/utils";
import {
  checkoutSchema,
  customOrderRequestSchema,
  adminLoginSchema,
  productSchema,
} from "../src/lib/validations";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName} ${detail ? `- ${detail}` : ""}`);
    failed++;
  }
}

console.log("\n==================================================");
console.log("🌸 RUNNING BLOOMCRAFT STUDIO TEST SUITE");
console.log("==================================================\n");

// 1. Currency & Money in Integer Paise (Rule from Blueprint: "INR integer paise")
console.log("TEST GROUP 1: Currency & Paise Formatter");
assert(formatPaise(79900) === "₹799", "79900 paise formats correctly to ₹799");
assert(formatPaise(24950) === "₹249.50" || formatPaise(24950) === "₹249.5", "24950 paise formats correctly to ₹249.50");
assert(formatPaise(0) === "₹0", "0 paise formats to ₹0");

// 2. Order Number & Request Number Generation
console.log("\nTEST GROUP 2: Identifier Generators");
const orderNum1 = generateOrderNumber();
const orderNum2 = generateOrderNumber();
assert(orderNum1.startsWith("BC"), "Order number begins with BC prefix");
assert(orderNum1.length >= 10, "Order number contains proper length timestamp & random digits");
assert(orderNum1 !== orderNum2, "Subsequent generated order numbers are unique");

const reqNum = generateRequestNumber();
assert(reqNum.startsWith("CR"), "Custom Request number begins with CR prefix");

// 3. State Machine Transitions (Rule from Blueprint: "Enforce valid transitions")
console.log("\nTEST GROUP 3: Order State Machine Transitions");
assert(
  isValidTransition("PENDING_PAYMENT", "PLACED", VALID_ORDER_TRANSITIONS),
  "PENDING_PAYMENT can transition to PLACED"
);
assert(
  isValidTransition("PLACED", "CONFIRMED", VALID_ORDER_TRANSITIONS),
  "PLACED can transition to CONFIRMED"
);
assert(
  isValidTransition("CONFIRMED", "IN_PRODUCTION", VALID_ORDER_TRANSITIONS),
  "CONFIRMED can transition to IN_PRODUCTION"
);
assert(
  isValidTransition("IN_PRODUCTION", "READY_TO_DISPATCH", VALID_ORDER_TRANSITIONS),
  "IN_PRODUCTION can transition to READY_TO_DISPATCH"
);
assert(
  isValidTransition("READY_TO_DISPATCH", "SHIPPED", VALID_ORDER_TRANSITIONS),
  "READY_TO_DISPATCH can transition to SHIPPED"
);
assert(
  isValidTransition("SHIPPED", "DELIVERED", VALID_ORDER_TRANSITIONS),
  "SHIPPED can transition to DELIVERED"
);
// Invalid jump rejection
assert(
  !isValidTransition("PENDING_PAYMENT", "DELIVERED", VALID_ORDER_TRANSITIONS),
  "REJECTS invalid leap from PENDING_PAYMENT directly to DELIVERED"
);
assert(
  !isValidTransition("DELIVERED", "IN_PRODUCTION", VALID_ORDER_TRANSITIONS),
  "REJECTS invalid reverse transition from DELIVERED to IN_PRODUCTION"
);

// 4. Custom Request State Machine
console.log("\nTEST GROUP 4: Custom Request State Machine");
assert(
  isValidTransition("SUBMITTED", "UNDER_REVIEW", VALID_CUSTOM_REQUEST_TRANSITIONS),
  "SUBMITTED can transition to UNDER_REVIEW"
);
assert(
  isValidTransition("UNDER_REVIEW", "QUOTED", VALID_CUSTOM_REQUEST_TRANSITIONS),
  "UNDER_REVIEW can transition to QUOTED"
);
assert(
  isValidTransition("QUOTED", "ACCEPTED", VALID_CUSTOM_REQUEST_TRANSITIONS),
  "QUOTED can transition to ACCEPTED"
);
assert(
  isValidTransition("ACCEPTED", "CONVERTED", VALID_CUSTOM_REQUEST_TRANSITIONS),
  "ACCEPTED can transition to CONVERTED"
);
assert(
  !isValidTransition("SUBMITTED", "CONVERTED", VALID_CUSTOM_REQUEST_TRANSITIONS),
  "REJECTS unquoted submission converting directly to CONVERTED"
);

// 5. Checkout Schema Validation (Indian Address & Phone Rules)
console.log("\nTEST GROUP 5: Checkout Schema & Indian Address Rules");
const validCheckout = {
  customerName: "Riya Sharma",
  customerPhone: "9876543210",
  customerEmail: "riya@example.com",
  shippingAddress: {
    recipientName: "Riya Sharma",
    phoneE164: "9876543210",
    addressLine1: "124, Civil Lines Road",
    city: "Jhansi",
    state: "Uttar Pradesh",
    postalCode: "284001",
    countryCode: "IN",
  },
  items: [
    {
      productId: "654321654321654321654321",
      quantity: 2,
    },
  ],
  paymentMethod: "ONLINE" as const,
};

const checkParsed = checkoutSchema.safeParse(validCheckout);
assert(checkParsed.success, "Valid checkout submission succeeds");

// Invalid Indian PIN code (must be 6 digits, not starting with 0)
const invalidPinCheckout = {
  ...validCheckout,
  shippingAddress: {
    ...validCheckout.shippingAddress,
    postalCode: "01234", // invalid: 5 digits and starts with 0
  },
};
assert(
  !checkoutSchema.safeParse(invalidPinCheckout).success,
  "REJECTS invalid 5-digit PIN code"
);

// Invalid phone number
const invalidPhoneCheckout = {
  ...validCheckout,
  customerPhone: "12345", // invalid
};
assert(
  !checkoutSchema.safeParse(invalidPhoneCheckout).success,
  "REJECTS invalid phone number"
);

// Empty cart
const emptyCartCheckout = {
  ...validCheckout,
  items: [],
};
assert(
  !checkoutSchema.safeParse(emptyCartCheckout).success,
  "REJECTS empty items array in checkout"
);

// 6. Custom Request Validation
console.log("\nTEST GROUP 6: Custom Order Inquiry Validation");
const validCustomReq = {
  customerName: "Pooja Gupta",
  phoneE164: "9898989898",
  description: "I need 5 white lilies and 2 sunflowers for a birthday bouquet.",
  preferredColours: ["White", "Yellow"],
  occasion: "Birthday",
};
assert(
  customOrderRequestSchema.safeParse(validCustomReq).success,
  "Valid custom inquiry schema succeeds"
);

const shortDescReq = {
  ...validCustomReq,
  description: "Hi", // too short (must be >= 10 chars)
};
assert(
  !customOrderRequestSchema.safeParse(shortDescReq).success,
  "REJECTS custom inquiry with description < 10 characters"
);

console.log("\n==================================================");
console.log(`🌸 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==================================================\n");

if (failed > 0) {
  process.exit(1);
}

