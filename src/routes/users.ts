import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  updateProfile, 
  changePassword 
} from '../controllers/userController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin routes
router.get('/', admin, getUsers);
router.get('/:id', admin, getUserById);
router.put('/:id', admin, updateUser);
router.delete('/:id', admin, deleteUser);

// User routes
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

export default router; 