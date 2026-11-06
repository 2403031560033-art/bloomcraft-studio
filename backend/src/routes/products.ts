import { Router, Request, Response } from 'express';
import { Product, Category } from '../models/index.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, q, availability, minPrice, maxPrice, sort = 'newest', page = '1', limit = '24' } = req.query;

    const query: any = { isPublished: true, archivedAt: null };

    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) query.categoryId = catDoc._id;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q as string, $options: 'i' } },
        { shortDescription: { $regex: q as string, $options: 'i' } },
        { tags: { $in: [new RegExp(q as string, 'i')] } },
      ];
    }

    if (availability) {
      query.fulfilmentType = availability;
    }

    if (minPrice || maxPrice) {
      query.basePricePaise = {};
      if (minPrice) query.basePricePaise.$gte = Number(minPrice) * 100;
      if (maxPrice) query.basePricePaise.$lte = Number(maxPrice) * 100;
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { basePricePaise: 1 };
    else if (sort === 'price-desc') sortOption = { basePricePaise: -1 };
    else if (sort === 'name-asc') sortOption = { name: 1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).populate('categoryId', 'name slug').sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isPublished: true, archivedAt: null })
      .populate('categoryId', 'name slug');

    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    }

    return res.json({ success: true, data: product });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

export default router;
