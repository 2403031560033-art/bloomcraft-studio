export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export function formatPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BC${year}${month}${day}${random}`;
}

export function generateRequestNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CR${year}${month}${random}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '…';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
    PLACED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PRODUCTION: 'bg-purple-100 text-purple-800',
    READY_TO_DISPATCH: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-cyan-100 text-cyan-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PAYMENT_FAILED: 'bg-red-100 text-red-800',
    REFUND_PENDING: 'bg-orange-100 text-orange-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
    ON_HOLD: 'bg-amber-100 text-amber-800',
    UNPAID: 'bg-yellow-100 text-yellow-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    COD_DUE: 'bg-amber-100 text-amber-800',
    SUBMITTED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-purple-100 text-purple-800',
    NEEDS_INFORMATION: 'bg-yellow-100 text-yellow-800',
    QUOTED: 'bg-indigo-100 text-indigo-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    DECLINED: 'bg-red-100 text-red-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    CONVERTED: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export const VALID_ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['PLACED', 'PAYMENT_FAILED', 'CANCELLED'],
  PLACED: ['CONFIRMED', 'CANCELLED', 'ON_HOLD'],
  CONFIRMED: ['IN_PRODUCTION', 'CANCELLED', 'ON_HOLD'],
  IN_PRODUCTION: ['READY_TO_DISPATCH', 'ON_HOLD'],
  READY_TO_DISPATCH: ['SHIPPED', 'ON_HOLD'],
  SHIPPED: ['DELIVERED'],
  ON_HOLD: ['CONFIRMED', 'IN_PRODUCTION', 'READY_TO_DISPATCH', 'CANCELLED'],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
  DELIVERED: ['REFUND_PENDING'],
  REFUND_PENDING: ['REFUNDED'],
};

export const VALID_CUSTOM_REQUEST_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'DECLINED', 'CLOSED'],
  UNDER_REVIEW: ['NEEDS_INFORMATION', 'QUOTED', 'DECLINED', 'CLOSED'],
  NEEDS_INFORMATION: ['UNDER_REVIEW', 'QUOTED', 'DECLINED', 'CLOSED'],
  QUOTED: ['ACCEPTED', 'DECLINED', 'CLOSED', 'NEEDS_INFORMATION'],
  ACCEPTED: ['CONVERTED', 'CLOSED'],
  DECLINED: ['CLOSED'],
};

export function isValidTransition(
  from: string,
  to: string,
  transitions: Record<string, string[]>
): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

