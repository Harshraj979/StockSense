import { z } from 'zod';

export const registerSchema = z.object({
  loginId: z
    .string()
    .min(6, { message: 'Login Id must be between 6 and 12 characters.' })
    .max(12, { message: 'Login Id must be between 6 and 12 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, { message: 'Login Id can only contain letters, numbers, and underscores.' }),
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' }),
  name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' }),
  role: z
    .enum(['MANAGER', 'STAFF'])
    .optional()
    .default('STAFF'),
  password: z
    .string()
    .min(8, { message: 'Password must be between 8 and 15 characters.' })
    .max(15, { message: 'Password must be between 8 and 15 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character (!@#$%^&*...).' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export const loginSchema = z.object({
  loginId: z.string().min(1, { message: 'Login Id is required.' }),
  password: z.string().min(1, { message: 'Password is required.' })
});

export const forgotPasswordSchema = z.object({
  emailOrLoginId: z.string().min(1, { message: 'Please enter your Login Id or Email.' })
});

export const resetPasswordSchema = z.object({
  emailOrLoginId: z.string().min(1, { message: 'Email or Login Id is required.' }),
  otp: z.string().length(6, { message: 'OTP must be exactly 6 digits.' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be between 8 and 15 characters.' })
    .max(15, { message: 'Password must be between 8 and 15 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
