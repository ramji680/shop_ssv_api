import express from 'express';
import { register, login, getMe, setupSampleUsers, validateSession, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/setup-sample-users', setupSampleUsers);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.get('/validate', validateSession);
router.post('/logout', logout);

export default router; 