import { Router, Request, Response } from 'express';
import { CustomOrderRequest } from '../models/index.js';
import { customOrderRequestSchema } from '../lib/validations.js';
import { generateCustomRequestNumber } from '../lib/utils.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = customOrderRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid custom request', details: parsed.error.issues },
      });
    }

    const data = parsed.data;
    const requestNumber = generateCustomRequestNumber();

    const newRequest = await CustomOrderRequest.create({
      requestNumber,
      customerName: data.customerName,
      phoneE164: data.phone,
      email: data.email || undefined,
      description: data.description,
      occasion: data.occasion,
      preferredColours: data.preferredColours,
      budgetRange: data.budgetRange,
      requiredByDate: data.requiredByDate ? new Date(data.requiredByDate) : undefined,
      inspirationImageUrl: data.inspirationImageUrl,
      status: 'SUBMITTED',
      auditHistory: [
        {
          action: 'SUBMITTED',
          actor: 'PATRON',
          note: 'Custom inquiry submitted via storefront portal.',
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: {
        requestNumber: newRequest.requestNumber,
        status: newRequest.status,
        message: 'Your bespoke inquiry has been received! Soni from BloomCraft Studio will review and WhatsApp you.',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
