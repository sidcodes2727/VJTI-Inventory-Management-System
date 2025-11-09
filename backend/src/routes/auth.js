import { Router } from 'express';
import { login, signup, listUsers, updateUser, resetPassword } from '../controllers/AuthController.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.post('/signup', authMiddleware, roleMiddleware('admin'), signup);
router.get('/users', authMiddleware, roleMiddleware('admin'), listUsers);
router.put('/users/:id', authMiddleware, roleMiddleware('admin'), updateUser);
router.post('/users/:id/reset-password', authMiddleware, roleMiddleware('admin'), resetPassword);

export default router;
