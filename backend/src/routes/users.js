import UserController from '../controllers/userController.js';
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const userController = new UserController();
const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userController.create);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

export default router;
