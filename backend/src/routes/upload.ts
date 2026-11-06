import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage } from '../config/cloudinary.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'No file provided in request' } });
    }

    const folder = (req.body?.folder as string) || 'bloomcraft';
    const result = await uploadImage(req.file.buffer, folder);

    return res.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'UPLOAD_FAILED', message: error.message || 'Image upload failed' } });
  }
});

export default router;
