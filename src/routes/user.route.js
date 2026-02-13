import express from 'express';
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats
} from '../controllers/user.controller.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { getUserByIdSchema, deleteUserSchema } from '../validators/user.validators.js';

const router = express.Router();



router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// User statistics (must be before /:id route)
router.get('/stats', getUserStats);


router.get('/', getAllUsers);
router.get('/:id', validate(getUserByIdSchema), getUserById);
router.delete('/:id', validate(deleteUserSchema), deleteUser);

export default router;
