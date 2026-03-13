import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { upload } from '../config/upload';

const router = Router();
const uploadController = new UploadController();

router.post(
  '/extract',
  upload.single('file'),
  (req, res) => uploadController.extractText(req, res)
);

export default router;