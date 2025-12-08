import TransactionController from '../controllers/transactionController.js';
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const transactionController = new TransactionController();
const router = express.Router();

router.get('/', authenticateToken, transactionController.getAll);
router.get('/:id', authenticateToken, transactionController.getById);
router.post('/', authenticateToken, transactionController.create);
router.put('/:id', authenticateToken, transactionController.update);
router.delete('/:id', authenticateToken, transactionController.remove);

export default router;
