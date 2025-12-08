import { Router } from 'express';
import {
    createActive,
    getActives,
    getActiveById,
    updateActive,
    deleteActive,
} from '../controllers/activeController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = Router();

// All active routes require authentication
router.use(authenticateToken);

// Create a new active
router.post('/', createActive);

// Get all actives for the authenticated user
router.get('/', getActives);

// Get a single active by ID
router.get('/:id', getActiveById);

// Update an active by ID
router.put('/:id', updateActive);

// Delete an active by ID
router.delete('/:id', deleteActive);

export default router;
