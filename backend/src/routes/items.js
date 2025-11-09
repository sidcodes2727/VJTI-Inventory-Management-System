import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { createItem, listItems, getItem, updateItem, deleteItem, updateItemStatus, transferStock } from '../controllers/ItemController.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listItems); // admin sees all; lab sees own
router.get('/:id', getItem);

router.post('/', roleMiddleware('admin'), createItem);
router.put('/:id', roleMiddleware('admin'), updateItem);
router.delete('/:id', roleMiddleware('admin'), deleteItem);

router.patch('/:id/status', roleMiddleware('admin', 'lab'), updateItemStatus);
router.post('/transfer', roleMiddleware('admin'), transferStock);

export default router;
