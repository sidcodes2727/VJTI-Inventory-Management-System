import { Router } from 'express';
import { createLab, listLabs, getLab, updateLab, deleteLab } from '../controllers/LabController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', roleMiddleware('admin'), listLabs);
router.post('/', roleMiddleware('admin'), createLab);
router.get('/:id', roleMiddleware('admin'), getLab);
router.put('/:id', roleMiddleware('admin'), updateLab);
router.delete('/:id', roleMiddleware('admin'), deleteLab);

export default router;
