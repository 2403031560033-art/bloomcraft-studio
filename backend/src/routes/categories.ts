import { Router, Request, Response } from 'express';
import { Category } from '../models/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    return res.json({ success: true, data: categories });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
      isActive: true,
    });
    if (!category) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    return res.json({ success: true, data: category });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
