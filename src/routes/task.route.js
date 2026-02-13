import express from 'express';
import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getTaskStats
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskByIdSchema,
  deleteTaskSchema
} from '../validators/task.validator.js';
import { createLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();


router.use(authenticate);

router.get('/stats', getTaskStats);

router.post('/', createLimiter, validate(createTaskSchema), createTask);
router.get('/', getMyTasks);
router.get('/:id', validate(getTaskByIdSchema), getTaskById);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', validate(deleteTaskSchema), deleteTask);

export default router;
