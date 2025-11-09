import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';
import { createRequest, listAll, listMine, approve, reject } from '../controllers/StockRequestController.js';

const router = Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('lab'), createRequest);
router.get('/', roleMiddleware('admin'), listAll);
router.get('/mine', roleMiddleware('lab'), listMine);
router.post('/:id/approve', roleMiddleware('admin'), approve);
router.post('/:id/reject', roleMiddleware('admin'), reject);

export default router;
