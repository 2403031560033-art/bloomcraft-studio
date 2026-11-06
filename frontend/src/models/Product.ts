import mongoose, { Schema, Document, Model } from 'mongoose';

export type FulfilmentType = 'READY_STOCK' | 'MADE_TO_ORDER' | 'CUSTOM_ONLY';

export interface IProductImage {
  _id?: mongoose.Types.ObjectId;
  imageUrl: string;
  publicId?: string;
  altText: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  name: string;
  sku?: string;
  priceDeltaPaise: number;
  stockQuantity?: number;
  isActive: boolean;
}

export interface IPersonalisationField {
  fieldName: string;
  fieldType: 'text' | 'textarea' | 'select';
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  maxLength?: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  sku?: string;
  shortDescription: string;
  description: string;
  basePricePaise: number;
  currency: string;
  fulfilmentType: FulfilmentType;
  stockQuantity?: number;
  preparationMinDays?: number;
  preparationMaxDays?: number;
  isPublished: boolean;
  archivedAt?: Date;
  images: IProductImage[];
  variants: IProductVariant[];
  personalisationFields: IPersonalisationField[];
  tags: string[];
  careInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  imageUrl: { type: String, required: true },
  publicId: { type: String },
  altText: { type: String, default: '' },
  sortOrder: { type: Number, default: 0 },
  isPrimary: { type: Boolean, default: false },
});

const ProductVariantSchema = new Schema<IProductVariant>({
  name: { type: String, required: true, trim: true },
  sku: { type: String, trim: true },
  priceDeltaPaise: { type: Number, default: 0 },
  stockQuantity: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true },
});

const PersonalisationFieldSchema = new Schema<IPersonalisationField>({
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['text', 'textarea', 'select'], default: 'text' },
  label: { type: String, required: true },
  placeholder: { type: String },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
  maxLength: { type: Number },
});

const ProductSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    name: { type: String, required: true, maxlength: 160, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, trim: true, sparse: true },
    shortDescription: { type: String, maxlength: 300, default: '' },
    description: { type: String, default: '' },
    basePricePaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', maxlength: 3 },
    fulfilmentType: {
      type: String,
      enum: ['READY_STOCK', 'MADE_TO_ORDER', 'CUSTOM_ONLY'],
      required: true,
    },
    stockQuantity: { type: Number, min: 0 },
    preparationMinDays: { type: Number, min: 0 },
    preparationMaxDays: { type: Number, min: 0 },
    isPublished: { type: Boolean, default: false },
    archivedAt: { type: Date },
    images: [ProductImageSchema],
    variants: [ProductVariantSchema],
    personalisationFields: [PersonalisationFieldSchema],
    tags: [{ type: String, trim: true }],
    careInstructions: { type: String },
  },
  { timestamps: true }
);

ProductSchema.index({ isPublished: 1, categoryId: 1 });
ProductSchema.index({ name: 'text', shortDescription: 'text', tags: 'text' });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

