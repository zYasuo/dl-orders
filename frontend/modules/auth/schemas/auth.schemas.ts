import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z
        .string()
        .min(12, 'A senha deve ter pelo menos 12 caracteres')
        .max(64, 'A senha deve ter no máximo 64 caracteres'),
    name: z.string().max(200).optional(),
});

export type SignupFormValues = z.infer<typeof signupSchema>;

export const otpSchema = z.object({
    email: z.string().email('E-mail inválido'),
    code: z
        .string()
        .length(6, 'Informe os 6 dígitos')
        .regex(/^\d+$/, 'Apenas números'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const signinSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z
        .string()
        .min(12, 'A senha deve ter pelo menos 12 caracteres')
        .max(64, 'A senha deve ter no máximo 64 caracteres'),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

export const resetPasswordSchema = z.object({
    email: z.string().email('E-mail inválido'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
    email: z.string().email('E-mail inválido'),
    token: z.string().min(1, 'Token obrigatório'),
    newPassword: z
        .string()
        .min(12, 'A senha deve ter pelo menos 12 caracteres')
        .max(64, 'A senha deve ter no máximo 64 caracteres'),
});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
