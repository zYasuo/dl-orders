'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/modules/auth/schemas/auth.schemas';
import { changePassword } from '@/modules/auth/api';
import { ApiError } from '@/types/api';

export function ChangePasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const email = searchParams.get('email') ?? '';
    const { toast } = useToast();

    const form = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { email, token, newPassword: '' },
    });

    async function onSubmit(values: ChangePasswordFormValues) {
        try {
            await changePassword({
                email: values.email,
                token: values.token,
                newPassword: values.newPassword,
            });
            toast({
                message: 'Password updated. Sign in.',
                variant: 'success',
                action: { label: 'Sign in', onClick: () => router.push('/auth/signin') },
            });
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Could not change password.';
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Field label="Token" htmlFor="token" error={form.formState.errors.token?.message}>
                <Input id="token" autoComplete="off" {...form.register('token')} />
            </Field>
            <Field label="New password" htmlFor="newPassword" error={form.formState.errors.newPassword?.message}>
                <Input id="newPassword" type="password" autoComplete="new-password" {...form.register('newPassword')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Save password
            </Button>
        </form>
    );
}
