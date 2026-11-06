import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentProviderStatus = 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  provider: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerEventId?: string;
  amountPaise: number;
  currency: string;
  status: PaymentProviderStatus;
  method?: string;
  verifiedAt?: Date;
  redactedEvent?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    provider: { type: String, required: true },
    providerOrderId: { type: String },
    providerPaymentId: { type: String },
    providerEventId: { type: String, unique: true, sparse: true },
    amountPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
      default: 'CREATED',
    },
    method: { type: String },
    verifiedAt: { type: Date },
    redactedEvent: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

