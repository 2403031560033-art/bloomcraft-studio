import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bloomcraft_studio";

// Direct mongoose schemas for seed script execution
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    imageUrl: String,
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: String,
    shortDescription: String,
    description: String,
    basePricePaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    fulfilmentType: {
      type: String,
      enum: ["READY_STOCK", "MADE_TO_ORDER", "CUSTOM_ONLY"],
      required: true,
    },
    stockQuantity: Number,
    preparationMinDays: Number,
    preparationMaxDays: Number,
    isPublished: { type: Boolean, default: true },
    archivedAt: Date,
    images: [
      {
        imageUrl: String,
        publicId: String,
        altText: String,
        sortOrder: Number,
        isPrimary: Boolean,
      },
    ],
    variants: [
      {
        name: String,
        sku: String,
        priceDeltaPaise: Number,
        stockQuantity: Number,
        isActive: Boolean,
      },
    ],
    personalisationFields: [
      {
        fieldName: String,
        fieldType: String,
        label: String,
        placeholder: String,
        options: [String],
        required: Boolean,
        maxLength: Number,
      },
    ],
    tags: [String],
    careInstructions: String,
  },
  { timestamps: true }
);

const AdminUserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    passwordHash: String,
    role: { type: String, default: "OWNER" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

const BusinessSettingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "BloomCraft Studio" },
    supportEmail: String,
    supportPhone: String,
    instagramUrl: String,
    whatsappUrl: String,
    currency: { type: String, default: "INR" },
    shippingPolicy: String,
    returnPolicy: String,
    aboutContent: String,
    faqContent: String,
    termsContent: String,
    privacyContent: String,
    isCodEnabled: { type: Boolean, default: false },
    flatShippingRatePaise: { type: Number, default: 0 },
    freeShippingAbovePaise: Number,
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);
const BusinessSettings = mongoose.models.BusinessSettings || mongoose.model("BusinessSettings", BusinessSettingsSchema);

async function seed() {
  console.log("🌸 Connecting to MongoDB Atlas / URI:", MONGODB_URI.replace(/:([^@]+)@/, ":****@"));
  await mongoose.connect(MONGODB_URI);

  console.log("🌸 Clearing demo data for fresh seed...");
  await Category.deleteMany({});
  await Product.deleteMany({});
  await AdminUser.deleteMany({});
  await BusinessSettings.deleteMany({});

  // 1. Seed Admin User
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await AdminUser.create({
    name: "Soni (BloomCraft Founder)",
    email: "admin@bloomcraft.in",
    passwordHash,
    role: "OWNER",
    isActive: true,
  });
  console.log(`✅ Admin owner seeded: ${admin.email} / admin123`);

  // 2. Seed Business Settings
  await BusinessSettings.create({
    businessName: "BloomCraft Studio",
    supportEmail: "bloomcraftstudio@gmail.com",
    supportPhone: "+91-9876543210",
    instagramUrl: "https://www.instagram.com/bloomcraftstudio_",
    whatsappUrl: "https://wa.me/919876543210",
    currency: "INR",
    isCodEnabled: true,
    flatShippingRatePaise: 0, // Free launch shipping
    freeShippingAbovePaise: 99900,
  });
  console.log("✅ Business settings seeded");

  // 3. Seed Categories
  const categoriesData = [
    {
      name: "Bouquets",
      slug: "bouquets",
      description: "Everlasting hand-knitted crochet floral bouquets wrapped in craft paper with satin bows.",
      imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80",
      sortOrder: 1,
    },
    {
      name: "Flower Pots",
      slug: "flower-pots",
      description: "Desk and windowsill mini crochet flower pots knitted with durable soft yarn.",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
      sortOrder: 2,
    },
    {
      name: "Keychains",
      slug: "keychains",
      description: "Whimsical floral crochet keychains and bag charms with brass keyring hardware.",
      imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80",
      sortOrder: 3,
    },
    {
      name: "Toran & Wall Hangings",
      slug: "toran-wall-hangings",
      description: "Traditional and festive handmade floral torans, doorway accents, and wall decor.",
      imageUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80",
      sortOrder: 4,
    },
    {
      name: "Hair Accessories",
      slug: "hair-accessories",
      description: "Delicate handcrafted floral hair clips, barrettes, and tiaras.",
      imageUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=600&q=80",
      sortOrder: 5,
    },
    {
      name: "Custom Gifts",
      slug: "custom-gifts",
      description: "Personalised keepsakes, custom colour palettes, and tailored gift hampers.",
      imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      sortOrder: 6,
    },
  ];

  const catMap: Record<string, any> = {};
  for (const c of categoriesData) {
    const created = await Category.create(c);
    catMap[c.slug] = created._id;
  }
  console.log(`✅ ${Object.keys(catMap).length} Categories seeded`);

  // 4. Seed Products
  const productsData = [
    {
      categoryId: catMap["bouquets"],
      name: "Heart Rose Bouquet",
      slug: "heart-rose-bouquet",
      sku: "BC-BOUQ-001",
      shortDescription: "A romantic hand-crocheted red rose arrangement woven into a distinctive heart silhouette.",
      description: "Meticulously crocheted with high-grade milk cotton yarn. Features 9 vibrant scarlet roses formed into an elegant heart shape, surrounded by delicate white baby's breath accents and tied with a ruby satin ribbon.",
      basePricePaise: 79900, // ₹799
      fulfilmentType: "MADE_TO_ORDER",
      preparationMinDays: 2,
      preparationMaxDays: 4,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80",
          altText: "Heart Rose Bouquet front angle",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: "Classic Scarlet Red", priceDeltaPaise: 0, isActive: true },
        { name: "Dusty Pastel Pink", priceDeltaPaise: 5000, isActive: true }, // +₹50
      ],
      personalisationFields: [
        {
          fieldName: "tagMessage",
          fieldType: "text",
          label: "Custom Keepsake Tag Message",
          placeholder: "e.g. Always yours, Rohit",
          required: false,
          maxLength: 35,
        },
      ],
      tags: ["roses", "crochet bouquet", "anniversary", "handmade"],
      careInstructions: "Keep dry. Dust gently with a clean soft brush.",
    },
    {
      categoryId: catMap["flower-pots"],
      name: "Sunflower Crochet Pot",
      slug: "sunflower-crochet-pot",
      sku: "BC-POT-002",
      shortDescription: "A cheerful miniature sunflower standing bright in a textured knitted brown pot.",
      description: "Brighten your work desk or windowsill with an evergreen sunflower! Crafted from soft yarn with a flexible internal wire that lets you angle the petals towards the light.",
      basePricePaise: 49900, // ₹499
      fulfilmentType: "READY_STOCK",
      stockQuantity: 15,
      preparationMinDays: 1,
      preparationMaxDays: 2,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80",
          altText: "Sunflower Crochet Pot on desk",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: "Single Golden Bloom", priceDeltaPaise: 0, stockQuantity: 15, isActive: true },
        { name: "Double Sunflower Trio", priceDeltaPaise: 20000, stockQuantity: 8, isActive: true },
      ],
      tags: ["sunflower", "crochet pot", "desk decor", "ready stock"],
    },
    {
      categoryId: catMap["keychains"],
      name: "Crochet Flower Keychain",
      slug: "crochet-flower-keychain",
      sku: "BC-KEY-003",
      shortDescription: "Charming twin crochet blossoms with antique brass lobster clasp and keyring.",
      description: "Handcrafted miniature blossoms attached to sturdy hardware. Perfect for car keys, backpacks, tote bags, or small thoughtful party favors.",
      basePricePaise: 24900, // ₹249
      fulfilmentType: "READY_STOCK",
      stockQuantity: 25,
      preparationMinDays: 1,
      preparationMaxDays: 1,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80",
          altText: "Crochet flower keychains",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        { name: "Cream & Crimson Duo", priceDeltaPaise: 0, stockQuantity: 15, isActive: true },
        { name: "Lavender & Lilac Duo", priceDeltaPaise: 0, stockQuantity: 10, isActive: true },
      ],
      tags: ["keychains", "crochet accessories", "gift under 500"],
    },
    {
      categoryId: catMap["toran-wall-hangings"],
      name: "Shubh-Laabh Floral Toran",
      slug: "shubh-laabh-floral-toran",
      sku: "BC-TORAN-004",
      shortDescription: "Traditional handmade floral entrance door hanging with auspicious Shubh-Laabh motifs.",
      description: "Hand-crocheted marigolds and jasmine buds interspersed with golden beads and brass bells. Perfect for Diwali, housewarmings, and festive doorframes.",
      basePricePaise: 59900, // ₹599
      fulfilmentType: "MADE_TO_ORDER",
      preparationMinDays: 3,
      preparationMaxDays: 5,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=800&q=80",
          altText: "Handmade floral toran",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      tags: ["toran", "festive decor", "diwali", "puja"],
    },
    {
      categoryId: catMap["hair-accessories"],
      name: "Daisy Pearl Hair Clip",
      slug: "daisy-pearl-hair-clip",
      sku: "BC-HAIR-005",
      shortDescription: "Sweet hand-knitted white daisy hair barrette with faux freshwater pearl center.",
      description: "Mounted on an alligator clip with teeth for secure hold. Ideal for festive hairstyles, casual day outs, or bridal bridesmaids.",
      basePricePaise: 19900, // ₹199
      fulfilmentType: "READY_STOCK",
      stockQuantity: 20,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&w=800&q=80",
          altText: "Handmade daisy clip",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      tags: ["hair clips", "daisy", "accessories"],
    },
    {
      categoryId: catMap["bouquets"],
      name: "Eternal Lavender Bloom",
      slug: "eternal-lavender-bloom",
      sku: "BC-BOUQ-006",
      shortDescription: "Serene mix of purple lavender sprigs and cream lilies wrapped with plum tissue.",
      description: "A calming pastel arrangement featuring 5 lavender stems and 3 white lilies. Scent-free, allergen-free, and guaranteed to stay vibrant.",
      basePricePaise: 79900, // ₹799
      fulfilmentType: "MADE_TO_ORDER",
      preparationMinDays: 2,
      preparationMaxDays: 4,
      isPublished: true,
      images: [
        {
          imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=800&q=80",
          altText: "Lavender bouquet",
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      tags: ["lavender", "bouquets", "calm"],
    },
  ];

  for (const p of productsData) {
    await Product.create(p);
  }
  console.log(`✅ ${productsData.length} Products seeded successfully`);

  console.log("🌸 Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

