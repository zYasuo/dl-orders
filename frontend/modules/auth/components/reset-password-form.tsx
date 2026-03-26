'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/modules/auth/schemas/auth.schemas';
import { requestResetPasswordLink } from '@/modules/auth/api';
import { ApiError } from '@/types/api';

export function ResetPasswordForm() {
    const { toast } = useToast();
    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { email: '' },
    });

    async function onSubmit(values: ResetPasswordFormValues) {
        try {
            const res = await requestResetPasswordLink({ email: values.email });
            toast({ message: res.message, variant: 'success' });
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Não foi possível enviar o link.';
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Enviar link
            </Button>
        </form>
    );
}
