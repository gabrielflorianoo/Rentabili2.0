import WalletController from '../controllers/walletController.js';
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const walletController = new WalletController();
const router = express.Router();

// Aplica o middleware de autenticação a todas as rotas
router.use(authenticateToken);

router.get('/', walletController.getAll);
router.get('/:id', walletController.getById);
router.post('/', walletController.create);
router.put('/:id', walletController.update);
router.delete('/:id', walletController.remove);

export default router;
