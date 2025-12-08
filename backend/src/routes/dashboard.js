import express from 'express';
import DashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { cacheMiddleware } from '../middlewares/cacheMiddleware.js';

const router = express.Router();
const dashboardController = new DashboardController();

const DASHBOARD_CACHE_KEY = 'dashboard_data';
const DASHBOARD_TTL = 60;

router.get(
    '/summary',
    authenticateToken,
    cacheMiddleware(`${DASHBOARD_CACHE_KEY}_summary`, DASHBOARD_TTL),
    dashboardController.getSummary,
);

router.get(
    '/dashboard',
    authenticateToken,
    cacheMiddleware(DASHBOARD_CACHE_KEY, DASHBOARD_TTL),
    dashboardController.getDashboard,
);

router.get(
    '/debug',
    authenticateToken,
    dashboardController.getDebug,
);

export default router;
