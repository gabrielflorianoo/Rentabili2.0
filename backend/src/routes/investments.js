import InvestmentController from '../controllers/investmentController.js';
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const investmentController = new InvestmentController();
const router = express.Router();

router.get(
    '/total-invested',
    authenticateToken,
    investmentController.getTotalInvested,
);
router.get(
    '/different-actives-count',
    authenticateToken,
    investmentController.getDifferentActivesCount,
);
router.get('/gain-loss', authenticateToken, investmentController.getGainLoss);
router.post(
    '/simulate',
    authenticateToken,
    investmentController.simulateInvestment,
);

router.get('/:id', authenticateToken, investmentController.getById);

router.get('/', authenticateToken, investmentController.getAll);
router.post('/', authenticateToken, investmentController.create);
router.put('/:id', authenticateToken, investmentController.update);
router.delete('/:id', authenticateToken, investmentController.remove);

export default router;
