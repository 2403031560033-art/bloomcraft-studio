import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusinessSettings extends Document {
  _id: mongoose.Types.ObjectId;
  businessName: string;
  supportEmail?: string;
  supportPhone?: string;
  instagramUrl?: string;
  whatsappUrl?: string;
  currency: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  aboutContent?: string;
  faqContent?: string;
  termsContent?: string;
  privacyContent?: string;
  isCodEnabled: boolean;
  flatShippingRatePaise: number;
  freeShippingAbovePaise?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSettingsSchema = new Schema<IBusinessSettings>(
  {
    businessName: { type: String, default: 'BloomCraft Studio' },
    supportEmail: { type: String },
    supportPhone: { type: String },
    instagramUrl: { type: String, default: 'https://www.instagram.com/bloomcraftstudio_' },
    whatsappUrl: { type: String },
    currency: { type: String, default: 'INR' },
    shippingPolicy: { type: String, default: 'TODO: Configure shipping policy before launch.' },
    returnPolicy: { type: String, default: 'TODO: Configure return policy before launch.' },
    aboutContent: { type: String, default: 'TODO: Add about content.' },
    faqContent: { type: String, default: 'TODO: Add FAQ content.' },
    termsContent: { type: String, default: 'TODO: Configure terms and conditions.' },
    privacyContent: { type: String, default: 'TODO: Configure privacy policy.' },
    isCodEnabled: { type: Boolean, default: false },
    flatShippingRatePaise: { type: Number, default: 0, min: 0 },
    freeShippingAbovePaise: { type: Number, min: 0 },
  },
  { timestamps: true }
);

const BusinessSettings: Model<IBusinessSettings> =
  mongoose.models.BusinessSettings ||
  mongoose.model<IBusinessSettings>('BusinessSettings', BusinessSettingsSchema);

export default BusinessSettings;

