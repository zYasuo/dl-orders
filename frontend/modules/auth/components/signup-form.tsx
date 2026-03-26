'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signupSchema, type SignupFormValues } from '@/modules/auth/schemas/auth.schemas';
import { signUp } from '@/modules/auth/api';
import { ApiError } from '@/types/api';

export function SignupForm() {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '', name: '' },
    });

    async function onSubmit(values: SignupFormValues) {
        try {

            await signUp({
                email: values.email,
                password: values.password,
                name: values.name?.trim() ? values.name.trim() : undefined,
            });
            toast({ message: 'Conta criada. Verifique o e-mail com o código OTP.', variant: 'success' });
            router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);

        } catch (e) {

            const msg = e instanceof ApiError ? e.message : 'Não foi possível cadastrar.';
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="Nome" htmlFor="name" error={form.formState.errors.name?.message}>
                <Input id="name" autoComplete="name" {...form.register('name')} />
            </Field>
            <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Field label="Senha" htmlFor="password" hint="Mínimo 12 caracteres." error={form.formState.errors.password?.message}>
                <Input id="password" type="password" autoComplete="new-password" {...form.register('password')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Criar conta
            </Button>
        </form>
    );
}
