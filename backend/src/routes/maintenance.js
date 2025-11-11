import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { createRecord, listRecords, summary, templateCsv, importCsv } from '../controllers/MaintenanceController.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Create a maintenance record (lab/admin)
router.post('/', roleMiddleware('admin', 'lab'), createRecord);

// List records with filters
router.get('/', roleMiddleware('admin', 'lab'), listRecords);

// Summary aggregations
router.get('/summary', roleMiddleware('admin', 'lab'), summary);

// CSV template
router.get('/template', roleMiddleware('admin', 'lab'), templateCsv);

// CSV import
router.post('/import', roleMiddleware('admin', 'lab'), upload.single('file'), importCsv);

export default router;
