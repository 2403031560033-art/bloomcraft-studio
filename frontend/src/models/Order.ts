import mongoose, { Schema, Document, Model } from 'mongoose';

export type OrderSource = 'WEBSITE' | 'INSTAGRAM' | 'WHATSAPP' | 'MANUAL';
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY_TO_DISPATCH'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'PAYMENT_FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'ON_HOLD';

export type PaymentStatus =
  | 'UNPAID'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'COD_DUE';

export interface IOrderItem {
  _id?: mongoose.Types.ObjectId;
  productId?: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  productNameSnapshot: string;
  skuSnapshot?: string;
  variantSnapshot?: Record<string, unknown>;
  unitPricePaise: number;
  quantity: number;
  personalisation?: Record<string, unknown>;
  lineTotalPaise: number;
}

export interface IOrderStatusHistory {
  _id?: mongoose.Types.ObjectId;
  fromStatus?: string;
  toStatus: string;
  note?: string;
  actorAdminId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface IShippingAddressSnapshot {
  recipientName: string;
  phoneE164: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  source: OrderSource;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: string;
  shippingAddressSnapshot: IShippingAddressSnapshot;
  customerNameSnapshot: string;
  customerPhoneSnapshot: string;
  customerEmailSnapshot?: string;
  customerNote?: string;
  estimatedDispatchDate?: Date;
  trackingCarrier?: string;
  trackingNumber?: string;
  items: IOrderItem[];
  statusHistory: IOrderStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: Schema.Types.ObjectId },
  productNameSnapshot: { type: String, required: true },
  skuSnapshot: { type: String },
  variantSnapshot: { type: Schema.Types.Mixed },
  unitPricePaise: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  personalisation: { type: Schema.Types.Mixed },
  lineTotalPaise: { type: Number, required: true, min: 0 },
});

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  fromStatus: { type: String },
  toStatus: { type: String, required: true },
  note: { type: String },
  actorAdminId: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  createdAt: { type: Date, default: Date.now },
});

const ShippingAddressSnapshotSchema = new Schema<IShippingAddressSnapshot>(
  {
    recipientName: { type: String, required: true },
    phoneE164: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    countryCode: { type: String, default: 'IN' },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    source: {
      type: String,
      enum: ['WEBSITE', 'INSTAGRAM', 'WHATSAPP', 'MANUAL'],
      default: 'WEBSITE',
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT', 'PLACED', 'CONFIRMED', 'IN_PRODUCTION',
        'READY_TO_DISPATCH', 'SHIPPED', 'DELIVERED', 'CANCELLED',
        'PAYMENT_FAILED', 'REFUND_PENDING', 'REFUNDED', 'ON_HOLD',
      ],
      default: 'PENDING_PAYMENT',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'COD_DUE'],
      default: 'UNPAID',
    },
    subtotalPaise: { type: Number, required: true, min: 0 },
    shippingPaise: { type: Number, default: 0, min: 0 },
    discountPaise: { type: Number, default: 0, min: 0 },
    totalPaise: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    shippingAddressSnapshot: { type: ShippingAddressSnapshotSchema, required: true },
    customerNameSnapshot: { type: String, required: true },
    customerPhoneSnapshot: { type: String, required: true },
    customerEmailSnapshot: { type: String },
    customerNote: { type: String },
    estimatedDispatchDate: { type: Date },
    trackingCarrier: { type: String },
    trackingNumber: { type: String },
    items: [OrderItemSchema],
    statusHistory: [OrderStatusHistorySchema],
  },
  { timestamps: true }
);

OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerPhoneSnapshot: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

