import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { createComplaint, listMine, listAll, updateStatus, addAttachments } from '../controllers/ComplaintController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = Router();

router.use(authMiddleware);

// Lab in-charge: create and list own complaints
router.post('/', roleMiddleware('lab'), createComplaint);
router.get('/mine', roleMiddleware('lab'), listMine);

// Admin: list all complaints and update status
router.get('/', roleMiddleware('admin'), listAll);
router.patch('/:id/status', roleMiddleware('admin'), updateStatus);

// Attachments upload (lab/admin)
const uploadDir = path.resolve('uploads/complaints');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${ts}-${safe}`);
  }
});
const fileFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true); else cb(new Error('Only image files are allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 5 } });

router.post('/:id/attachments', roleMiddleware('lab', 'admin'), upload.array('files', 5), addAttachments);

export default router;
