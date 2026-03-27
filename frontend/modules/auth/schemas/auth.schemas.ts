import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .max(64, 'Password must be at most 64 characters'),
    name: z.string().max(200).optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
    email: z.string().email('Invalid email'),
    code: z
        .string()
        .length(6, 'Enter all 6 digits')
        .regex(/^\d+$/, 'Digits only'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const signinSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .max(64, 'Password must be at most 64 characters'),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
    email: z.string().email('Invalid email'),
    token: z.string().min(1, 'Token is required'),
    newPassword: z
        .string()
        .min(12, 'Password must be at least 12 characters')
        .max(64, 'Password must be at most 64 characters'),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
