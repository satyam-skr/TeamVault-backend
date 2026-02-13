import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string({
          required_error: 'Name is required',
          invalid_type_error: 'Name must be a string'
        })
        .trim()
        .min(2, { message: 'Name must be at least 2 characters long' })
        .max(100, { message: 'Name cannot exceed 100 characters' }),

      email: z
        .string({
          required_error: 'Email is required',
          invalid_type_error: 'Email must be a string'
        })
        .trim()
        .min(1, { message: 'Email cannot be empty' })
        .email({ message: 'Please provide a valid email address' })
        .toLowerCase(),

      password: z
        .string({
          required_error: 'Password is required',
          invalid_type_error: 'Password must be a string'
        })
        .min(6, { message: 'Password must be at least 6 characters long' })
        .max(100, { message: 'Password cannot exceed 100 characters' }),

      role: z
        .enum(['USER', 'ADMIN'], {
          errorMap: () => ({ message: 'Role must be either USER or ADMIN' })
        })
        .optional()
        .default('USER')
    })
    .strict({ message: 'Unknown fields are not allowed' })
});

// Login schema
export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: 'Email is required',
          invalid_type_error: 'Email must be a string'
        })
        .trim()
        .min(1, { message: 'Email cannot be empty' })
        .email({ message: 'Please provide a valid email address' })
        .toLowerCase(),

      password: z
        .string({
          required_error: 'Password is required',
          invalid_type_error: 'Password must be a string'
        })
        .min(1, { message: 'Password cannot be empty' })
    })
    .strict({ message: 'Unknown fields are not allowed' })
});

// Refresh token schema
export const refreshTokenSchema = z.object({
  body: z
    .object({
      refreshToken: z
        .string({
          required_error: 'Refresh token is required',
          invalid_type_error: 'Refresh token must be a string'
        })
        .trim()
        .min(1, { message: 'Refresh token cannot be empty' })
    })
    .strict({ message: 'Unknown fields are not allowed' })
});
