import { z } from 'zod';

/**
 * Zod request schemas. Each schema validates { body, query, params } selectively.
 * The `validate` middleware runs these and returns a 422 with field-level errors.
 */

const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .email('Please provide a valid email');

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name is too short').max(80),
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: emailSchema }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ required_error: 'Token is required' }).min(1, 'Token is required'),
    password: passwordSchema,
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string({ required_error: 'Token is required' }).min(1, 'Token is required'),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({ email: emailSchema }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      profilePicture: z.string().url('Profile picture must be a valid URL').or(z.literal('')).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' }),
});

export const updateRoleSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ role: z.enum(['admin', 'user'], { required_error: 'Role is required' }) }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1, 'Id is required') }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    role: z.enum(['admin', 'user']).optional(),
    search: z.string().optional(),
    sort: z.string().optional(),
  }),
});

export default {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  updateProfileSchema,
  updateRoleSchema,
  idParamSchema,
  listUsersSchema,
};
