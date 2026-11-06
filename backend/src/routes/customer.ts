import { Router, Response } from 'express';
import { Order, Customer } from '../models/index.js';
import { verifyCustomerAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/orders', verifyCustomerAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const customer = await Customer.findById(req.customer?.id);
    if (!customer) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Customer record not found' } });
    }

    const orders = await Order.find({
      $or: [
        { customerId: customer._id },
        { 'shippingAddress.phoneE164': customer.phoneE164 },
        ...(customer.email ? [{ customerEmail: customer.email }] : []),
      ],
    }).sort({ createdAt: -1 });

    return res.json({ success: true, data: orders });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
