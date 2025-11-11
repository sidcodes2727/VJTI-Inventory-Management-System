import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import multer from 'multer';
import { createItem, listItems, getItem, updateItem, deleteItem, updateItemStatus, transferStock, exportItems, importItems } from '../controllers/ItemController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.get('/', listItems); // admin sees all; lab sees own
router.get('/export', roleMiddleware('admin', 'lab'), exportItems);
router.get('/:id', getItem);

router.post('/', roleMiddleware('admin'), createItem);
router.put('/:id', roleMiddleware('admin'), updateItem);
router.delete('/:id', roleMiddleware('admin'), deleteItem);

router.patch('/:id/status', roleMiddleware('admin', 'lab'), updateItemStatus);
router.post('/transfer', roleMiddleware('admin'), transferStock);
router.post('/import', roleMiddleware('admin'), upload.single('file'), importItems);

export default router;
