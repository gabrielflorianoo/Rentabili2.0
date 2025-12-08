import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();
const authController = new AuthController();

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/register
router.post('/register', authController.register);

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
