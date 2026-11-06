import { Router, Request, Response } from 'express';
import { BusinessSettings } from '../models/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({
        storeName: 'BloomCraft Studio',
        instagramHandle: '@bloomcraftstudio_',
        locationCity: 'Jhansi',
        locationState: 'Uttar Pradesh',
        contactPhone: '+919140693061',
        contactEmail: 'hello@bloomcraft.in',
        flatShippingRatePaise: 7900,
        freeShippingAbovePaise: 99900,
        isCodEnabled: true,
      });
    }

    return res.json({
      success: true,
      data: {
        storeName: settings.storeName,
        instagramHandle: settings.instagramHandle,
        locationCity: settings.locationCity,
        locationState: settings.locationState,
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail,
        flatShippingRatePaise: settings.flatShippingRatePaise,
        freeShippingAbovePaise: settings.freeShippingAbovePaise,
        isCodEnabled: settings.isCodEnabled,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
