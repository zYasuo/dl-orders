'use client';

import { type ComponentProps } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldStack,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/query-keys';
import { signinSchema, type SigninFormValues } from '@/modules/auth/schemas/auth.schemas';
import { signIn } from '@/modules/auth/api';
import { ApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

function AppleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={cn('size-4 shrink-0', className)}
            aria-hidden
        >
            <path
                d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                fill="currentColor"
            />
        </svg>
    );
}

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={cn('size-4 shrink-0', className)}
            aria-hidden
        >
            <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
            />
        </svg>
    );
}

export function SigninForm({
    className,
    ...props
}: ComponentProps<'div'>) {
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
            await signIn({ email: values.email, password: values.password });
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

    function onSocialComingSoon(provider: string) {
        toast({ message: `Entrada com ${provider} ainda não está disponível.`, variant: 'warning' });
    }

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                    <CardDescription>
                        Entre com Apple ou Google, ou use e-mail e senha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup>
                            <FieldStack>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                    onClick={() => onSocialComingSoon('Apple')}
                                >
                                    <AppleIcon />
                                    Entrar com Apple
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                    onClick={() => onSocialComingSoon('Google')}
                                >
                                    <GoogleIcon />
                                    Entrar com Google
                                </Button>
                            </FieldStack>
                            <FieldSeparator>Ou continue com</FieldSeparator>
                            <FieldStack>
                                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="voce@exemplo.com"
                                    aria-invalid={!!form.formState.errors.email}
                                    {...form.register('email')}
                                />
                                {form.formState.errors.email ? (
                                    <p className="text-xs text-danger" role="alert">
                                        {form.formState.errors.email.message}
                                    </p>
                                ) : null}
                            </FieldStack>
                            <FieldStack>
                                <div className="flex items-center gap-2">
                                    <FieldLabel htmlFor="password">Senha</FieldLabel>
                                    <Link
                                        href="/auth/reset-password"
                                        className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={!!form.formState.errors.password}
                                    {...form.register('password')}
                                />
                                {form.formState.errors.password ? (
                                    <p className="text-xs text-danger" role="alert">
                                        {form.formState.errors.password.message}
                                    </p>
                                ) : null}
                            </FieldStack>
                            <FieldStack>
                                <Button type="submit" loading={form.formState.isSubmitting} className="w-full">
                                    Entrar
                                </Button>
                                <FieldDescription className="text-center">
                                    Não tem conta?{' '}
                                    <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
                                        Criar conta
                                    </Link>
                                </FieldDescription>
                            </FieldStack>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-2 text-center text-xs sm:px-6">
                Ao continuar, você concorda com os{' '}
                <span className="text-muted-foreground">Termos</span> e a{' '}
                <span className="text-muted-foreground">Política de Privacidade</span> (em breve).
            </FieldDescription>
        </div>
    );
}
