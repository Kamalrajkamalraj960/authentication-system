import { z } from 'zod';

/**
 * Client-side Zod schemas, mirrored from the backend validators. Used with
 * @hookform/resolvers for inline form validation before hitting the API.
 */

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[a-z]/, 'One lowercase letter')
  .regex(/[A-Z]/, 'One uppercase letter')
  .regex(/[0-9]/, 'One number');

const email = z.string().min(1, 'Email is required').email('Enter a valid email');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is too short').max(80),
    email,
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    password,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(80),
  profilePicture: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
});
