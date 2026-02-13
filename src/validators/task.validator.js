import { z } from 'zod';

// Create task schema
export const createTaskSchema = z.object({
  body: z
    .object({
      title: z
        .string({
          required_error: 'Task title is required',
          invalid_type_error: 'Title must be a string'
        })
        .trim()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(200, { message: 'Title cannot exceed 200 characters' }),

      description: z
        .string({
          required_error: 'Task description is required',
          invalid_type_error: 'Description must be a string'
        })
        .trim()
        .min(10, { message: 'Description must be at least 10 characters long' })
        .max(2000, { message: 'Description cannot exceed 2000 characters' }),

      status: z
        .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
          errorMap: () => ({ message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
        })
        .optional()
        .default('TODO')
    })
    .strict({ message: 'Unknown fields are not allowed' })
});

// Update task schema
export const updateTaskSchema = z.object({
  body: z
    .object({
      title: z
        .string({
          invalid_type_error: 'Title must be a string'
        })
        .trim()
        .min(3, { message: 'Title must be at least 3 characters long' })
        .max(200, { message: 'Title cannot exceed 200 characters' })
        .optional(),

      description: z
        .string({
          invalid_type_error: 'Description must be a string'
        })
        .trim()
        .min(10, { message: 'Description must be at least 10 characters long' })
        .max(2000, { message: 'Description cannot exceed 2000 characters' })
        .optional(),

      status: z
        .enum(['TODO', 'IN_PROGRESS', 'DONE'], {
          errorMap: () => ({ message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
        })
        .optional()
    })
    .strict({ message: 'Unknown fields are not allowed' })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field (title, description, or status) must be provided for update'
    }),

  params: z
    .object({
      id: z
        .string({
          required_error: 'Task ID is required',
          invalid_type_error: 'Task ID must be a string'
        })
        .uuid({ message: 'Task ID must be a valid UUID' })
    })
    .strict({ message: 'Unknown parameters are not allowed' })
});

// Get task by ID schema
export const getTaskByIdSchema = z.object({
  params: z
    .object({
      id: z
        .string({
          required_error: 'Task ID is required',
          invalid_type_error: 'Task ID must be a string'
        })
        .uuid({ message: 'Task ID must be a valid UUID' })
    })
    .strict({ message: 'Unknown parameters are not allowed' })
});

// Delete task schema
export const deleteTaskSchema = z.object({
  params: z
    .object({
      id: z
        .string({
          required_error: 'Task ID is required',
          invalid_type_error: 'Task ID must be a string'
        })
        .uuid({ message: 'Task ID must be a valid UUID' })
    })
    .strict({ message: 'Unknown parameters are not allowed' })
});
