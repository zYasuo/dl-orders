'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { otpSchema, type OtpFormValues } from '@/modules/auth/schemas/auth.schemas';
import { verifyOtpService } from '@/services/auth.service';
import { ApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function OtpForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') ?? '';
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<OtpFormValues>({
        resolver: zodResolver(otpSchema),
        defaultValues: { email: emailParam, code: '' },
    });

    async function onSubmit(values: OtpFormValues) {
        try {
            await verifyOtpService({ email: values.email, code: values.code });
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
            toast({ message: 'E-mail verificado. Você já pode usar a loja.', variant: 'success' });
            router.push('/products');
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Código inválido ou expirado.';
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Field label="Código OTP (6 dígitos)" htmlFor="code" error={form.formState.errors.code?.message}>
                <Input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" {...form.register('code')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Confirmar
            </Button>
        </form>
    );
}
