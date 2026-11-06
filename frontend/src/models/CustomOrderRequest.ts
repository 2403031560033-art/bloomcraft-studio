import mongoose, { Schema, Document, Model } from 'mongoose';

export type CustomRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'QUOTED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CLOSED'
  | 'CONVERTED';

export interface ICustomOrderRequest extends Document {
  _id: mongoose.Types.ObjectId;
  requestNumber: string;
  customerName: string;
  phoneE164: string;
  email?: string;
  occasion?: string;
  budgetMinPaise?: number;
  budgetMaxPaise?: number;
  preferredColours: string[];
  description: string;
  inspirationImageUrl?: string;
  inspirationImagePublicId?: string;
  requiredBy?: Date;
  status: CustomRequestStatus;
  quotePaise?: number;
  quoteValidUntil?: Date;
  adminNotes?: string;
  assignedAdminId?: mongoose.Types.ObjectId;
  convertedOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderRequestSchema = new Schema<ICustomOrderRequest>(
  {
    requestNumber: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true },
    phoneE164: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    occasion: { type: String, trim: true },
    budgetMinPaise: { type: Number, min: 0 },
    budgetMaxPaise: { type: Number, min: 0 },
    preferredColours: [{ type: String, trim: true }],
    description: { type: String, required: true },
    inspirationImageUrl: { type: String },
    inspirationImagePublicId: { type: String },
    requiredBy: { type: Date },
    status: {
      type: String,
      enum: [
        'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION', 'QUOTED',
        'ACCEPTED', 'DECLINED', 'CLOSED', 'CONVERTED',
      ],
      default: 'SUBMITTED',
    },
    quotePaise: { type: Number, min: 0 },
    quoteValidUntil: { type: Date },
    adminNotes: { type: String },
    assignedAdminId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    convertedOrderId: { type: Schema.Types.ObjectId, ref: 'Order', unique: true, sparse: true },
  },
  { timestamps: true }
);

CustomOrderRequestSchema.index({ status: 1, createdAt: -1 });
CustomOrderRequestSchema.index({ requestNumber: 1 });

const CustomOrderRequest: Model<ICustomOrderRequest> =
  mongoose.models.CustomOrderRequest ||
  mongoose.model<ICustomOrderRequest>('CustomOrderRequest', CustomOrderRequestSchema);

export default CustomOrderRequest;

