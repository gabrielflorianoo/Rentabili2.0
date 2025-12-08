import { Router } from 'express';
import {
    createHistoricalBalance,
    getHistoricalBalancesByActive,
    getHistoricalBalanceById,
    updateHistoricalBalance,
    deleteHistoricalBalance,
} from '../controllers/historicalBalanceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All historical balance routes require authentication
router.use(authenticateToken);

// Create a new historical balance for a specific active
router.post('/', createHistoricalBalance);

// Get all historical balances for a specific active
router.get('/active/:activeId', getHistoricalBalancesByActive);

// Get a single historical balance by ID
router.get('/:id', getHistoricalBalanceById);

// Update a historical balance by ID
router.put('/:id', updateHistoricalBalance);

// Delete a historical balance by ID
router.delete('/:id', deleteHistoricalBalance);

export default router;
