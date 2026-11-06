import { Router, Request, Response } from 'express';
import { Order } from '../models/index.js';

const router = Router();

router.get('/track', async (req: Request, res: Response) => {
  try {
    const { orderNumber, phone } = req.query;

    if (!orderNumber || !phone) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Order number and phone number are required for tracking' },
      });
    }

    const order = await Order.findOne({
      orderNumber: (orderNumber as string).toUpperCase().trim(),
    });

    if (!order) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Order not found' } });
    }

    const cleanOrderPhone = order.shippingAddress.phoneE164.replace(/\D/g, '');
    const cleanQueryPhone = (phone as string).replace(/\D/g, '');

    if (!cleanOrderPhone.endsWith(cleanQueryPhone.slice(-10))) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Order number does not match phone number records' },
      });
    }

    const sanitizedTimeline = order.timeline
      .filter((t) => t.isCustomerVisible)
      .map((t) => ({
        status: t.status,
        message: t.message,
        timestamp: t.timestamp,
      }));

    return res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        fulfilmentStatus: order.fulfilmentStatus,
        paymentStatus: order.paymentStatus,
        totalPaise: order.totalPaise,
        createdAt: order.createdAt,
        targetDispatchDate: order.targetDispatchDate,
        trackingCarrier: order.trackingCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        shippingCity: order.shippingAddress.city,
        shippingState: order.shippingAddress.state,
        items: order.items.map((i) => ({
          productName: i.productName,
          variantName: i.variantName,
          quantity: i.quantity,
          imageUrl: i.imageUrl,
        })),
        timeline: sanitizedTimeline,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
