import { z } from 'zod';

// Get user by ID schema
export const getUserByIdSchema = z.object({
  params: z
    .object({
      id: z
        .string({
          required_error: 'User ID is required',
          invalid_type_error: 'User ID must be a string'
        })
        .uuid({ message: 'User ID must be a valid UUID' })
    })
    .strict({ message: 'Unknown parameters are not allowed' })
});

// Delete user schema
export const deleteUserSchema = z.object({
  params: z
    .object({
      id: z
        .string({
          required_error: 'User ID is required',
          invalid_type_error: 'User ID must be a string'
        })
        .uuid({ message: 'User ID must be a valid UUID' })
    })
    .strict({ message: 'Unknown parameters are not allowed' })
});
