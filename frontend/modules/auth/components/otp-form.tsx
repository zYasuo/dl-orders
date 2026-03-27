'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { otpSchema, type OtpFormValues } from '@/modules/auth/schemas/auth.schemas';
import { verifyOtp } from '@/modules/auth/api';
import { ApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { userKeys } from '@/modules/users/query-keys';

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
            await verifyOtp({ email: values.email, code: values.code });
            await queryClient.invalidateQueries({ queryKey: userKeys.me });
            toast({
                message: 'Email verified. You can use the store.',
                variant: 'success',
                action: { label: 'Browse catalog', onClick: () => router.push('/products') },
            });
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Invalid or expired code.';
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Field label="OTP code (6 digits)" htmlFor="code" error={form.formState.errors.code?.message}>
                <Input id="code" inputMode="numeric" maxLength={6} autoComplete="one-time-code" {...form.register('code')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Confirm
            </Button>
        </form>
    );
}
