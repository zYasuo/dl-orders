'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { signinSchema, type SigninFormValues } from '@/modules/auth/schemas/auth.schemas';
import { signinService } from '@/services/auth.service';
import { ApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';

export function SigninForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get('returnUrl') || '/products';
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const form = useForm<SigninFormValues>({
        resolver: zodResolver(signinSchema),
        defaultValues: { email: '', password: '' },
    });

    async function onSubmit(values: SigninFormValues) {
        try {
            await signinService({ email: values.email, password: values.password });
            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });
            toast({ message: 'Login realizado.', variant: 'success' });
            router.push(returnUrl.startsWith('/') ? returnUrl : '/products');
        } catch (e) {
            let msg = 'Não foi possível entrar.';
            if (e instanceof ApiError) {
                msg = e.message;
                if (e.statusCode === 403) {
                    msg = 'Conta bloqueada temporariamente. Tente mais tarde.';
                }
                if (e.statusCode === 429) {
                    msg = 'Muitas tentativas. Aguarde e tente novamente.';
                }
            }
            toast({ message: msg, variant: 'error' });
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" {...form.register('email')} />
            </Field>
            <Field label="Senha" htmlFor="password" error={form.formState.errors.password?.message}>
                <Input id="password" type="password" autoComplete="current-password" {...form.register('password')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
                    Criar conta
                </Link>
                {' · '}
                <Link href="/auth/reset-password" className="text-primary underline-offset-4 hover:underline">
                    Esqueci a senha
                </Link>
            </p>
        </form>
    );
}
