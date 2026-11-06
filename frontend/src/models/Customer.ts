import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICustomerAddress {
  _id?: mongoose.Types.ObjectId;
  label?: string;
  recipientName: string;
  phoneE164: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
}

export interface ICustomer extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  email?: string;
  phoneE164: string;
  passwordHash?: string;
  addresses: ICustomerAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerAddressSchema = new Schema<ICustomerAddress>({
  label: { type: String, trim: true },
  recipientName: { type: String, required: true, trim: true },
  phoneE164: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  landmark: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  countryCode: { type: String, default: 'IN' },
  isDefault: { type: Boolean, default: false },
});

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phoneE164: { type: String, required: true, trim: true },
    passwordHash: { type: String },
    addresses: [CustomerAddressSchema],
  },
  { timestamps: true }
);

CustomerSchema.index({ phoneE164: 1 });
CustomerSchema.index({ email: 1 }, { sparse: true });

const Customer: Model<ICustomer> =
  mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
