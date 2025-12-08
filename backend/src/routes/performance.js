import { Router } from 'express';
import performanceController from '../controllers/performanceController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All performance routes require authentication
router.use(authenticateToken);

// Get gain/loss for a specific active with optional date range
router.get('/active/:activeId/gain-loss', (req, res) =>
    performanceController.getGainLossPercentage(req, res)
);

// Get performance by predefined periods (7d, 30d, 90d, 1y, all)
router.get('/active/:activeId/periods', (req, res) =>
    performanceController.getPerformanceByPeriod(req, res)
);

// Get performance for all actives with optional date range
router.get('/all', (req, res) =>
    performanceController.getAllPerformance(req, res)
);

// Get top performers (best and worst)
router.get('/top-performers', (req, res) =>
    performanceController.getTopPerformers(req, res)
);

// Get portfolio evolution over time
router.get('/evolution', (req, res) =>
    performanceController.getPortfolioEvolution(req, res)
);

// Get allocation by active type
router.get('/allocation', (req, res) =>
    performanceController.getAllocationByType(req, res)
);

// Get last balance dates
router.get('/last-dates', (req, res) =>
    performanceController.getLastBalanceDates(req, res)
);

export default router;
