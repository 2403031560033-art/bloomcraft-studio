import { Router, Request, Response } from 'express';
import { Payment, Order } from '../models/index.js';

const router = Router();

router.post('/payments/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const eventId = req.headers['x-razorpay-event-id'] || req.body?.event_id || req.body?.id;
    const eventType = req.body?.event || req.body?.type;
    const payload = req.body?.payload || req.body;

    if (!eventId) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing event ID' } });
    }

    const existingPayment = await Payment.findOne({ providerEventId: eventId });
    if (existingPayment) {
      return res.status(200).json({ status: 'ignored', message: 'Event already processed' });
    }

    if (eventType === 'payment.captured' || eventType === 'payment.successful') {
      const orderId = payload?.payment?.entity?.notes?.orderId || payload?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'PAID';
          order.fulfilmentStatus = 'CONFIRMED';
          order.timeline.push({
            status: 'CONFIRMED',
            message: 'Payment confirmed via webhook. Order moved to production queue.',
            timestamp: new Date(),
          });
          await order.save();

          await Payment.create({
            orderId: order._id,
            paymentMethod: 'ONLINE',
            provider: provider.toUpperCase(),
            amountPaise: order.totalPaise,
            currency: 'INR',
            status: 'SUCCESS',
            providerPaymentId: payload?.payment?.entity?.id || String(eventId),
            providerEventId: String(eventId),
          });
        }
      }
    }

    return res.status(200).json({ status: 'ok', received: true });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
