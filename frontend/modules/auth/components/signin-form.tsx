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
import { cn } from '@/lib/utils';
import { signinSchema, type SigninFormValues } from '@/modules/auth/schemas/auth.schemas';
import { signIn } from '@/modules/auth/api';
import { ApiError } from '@/types/api';
import { useQueryClient } from '@tanstack/react-query';

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

const socialBtnClass =
    'h-11 w-full rounded-xl border border-white/10 bg-background/50 text-sm font-medium shadow-sm transition-colors hover:border-white/15 hover:bg-muted/60';

export function SigninForm({ className, ...props }: ComponentProps<'div'>) {
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
            const { email, password } = values;

            await signIn({ email, password });

            await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });

            const nextPath = returnUrl.startsWith('/') ? returnUrl : '/products';
            toast({
                message: 'Signed in successfully.',
                variant: 'success',
                action: { label: 'Continue', onClick: () => router.push(nextPath) },
            });
        } catch (e) {
            let msg = 'Could not sign in.';
            if (e instanceof ApiError) {
                msg = e.message;
                if (e.statusCode === 403) {
                    msg = 'Account temporarily locked. Try again later.';
                }

                if (e.statusCode === 429) {
                    msg = 'Too many attempts. Wait and try again.';
                }
            }

            toast({ message: msg, variant: 'error' });
        }
    }

    function onSocialComingSoon(provider: string) {
        toast({
            message: `Sign-in with ${provider} is not available yet.`,
            variant: 'warning',
            action: { label: 'Got it', onClick: () => {} },
        });
    }

    const inputClass =
        'h-11 rounded-xl border-white/10 bg-background/60 text-[15px] shadow-inner shadow-black/20 placeholder:text-muted-foreground/80';

    return (
        <div className={cn('flex flex-col gap-8', className)} {...props}>
            <Card
                className={cn(
                    'overflow-hidden rounded-2xl border-white/9 bg-card/80 text-card-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_32px_64px_-28px_rgba(0,0,0,0.75)] backdrop-blur-xl',
                )}
            >
                <CardHeader className="space-y-4 px-8 pb-0 pt-9 text-center">
                    <div
                        className="mx-auto h-1 w-16 rounded-full bg-primary shadow-[0_0_24px_-4px_var(--primary)]"
                        aria-hidden
                    />
                    <div className="space-y-2">
                        <CardTitle className="text-balance text-2xl font-semibold tracking-tight md:text-[1.65rem] md:leading-tight">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="mx-auto max-w-xs text-balance text-[15px] leading-relaxed text-muted-foreground">
                            Sign in to keep shopping. Email and password below — Apple and Google coming soon.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-9 pt-7">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-7">
                            <FieldStack className="gap-3">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className={socialBtnClass}
                                    onClick={() => onSocialComingSoon('Apple')}
                                >
                                    <AppleIcon />
                                    Continue with Apple
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className={socialBtnClass}
                                    onClick={() => onSocialComingSoon('Google')}
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </Button>
                            </FieldStack>
                            <FieldSeparator className="py-0.5">Or continue with</FieldSeparator>
                            <FieldStack className="gap-2.5">
                                <FieldLabel className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground" htmlFor="email">
                                    Email
                                </FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    aria-invalid={!!form.formState.errors.email}
                                    className={inputClass}
                                    {...form.register('email')}
                                />
                                {form.formState.errors.email ? (
                                    <p className="text-xs text-danger" role="alert">
                                        {form.formState.errors.email.message}
                                    </p>
                                ) : null}
                            </FieldStack>
                            <FieldStack className="gap-2.5">
                                <div className="flex items-baseline justify-between gap-3">
                                    <FieldLabel
                                        className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
                                        htmlFor="password"
                                    >
                                        Password
                                    </FieldLabel>
                                    <Link
                                        href="/auth/reset-password"
                                        className="text-xs font-medium text-primary underline-offset-4 outline-none ring-offset-background hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    aria-invalid={!!form.formState.errors.password}
                                    className={inputClass}
                                    {...form.register('password')}
                                />
                                {form.formState.errors.password ? (
                                    <p className="text-xs text-danger" role="alert">
                                        {form.formState.errors.password.message}
                                    </p>
                                ) : null}
                            </FieldStack>
                            <FieldStack className="gap-4 pt-1">
                                <Button
                                    type="submit"
                                    loading={form.formState.isSubmitting}
                                    size="lg"
                                    className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-primary/25"
                                >
                                    Sign in
                                </Button>
                                <FieldDescription className="text-center text-[15px] text-muted-foreground">
                                    New here?{' '}
                                    <Link
                                        href="/auth/signup"
                                        className="font-semibold text-primary underline-offset-4 outline-none ring-offset-background hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        Create an account
                                    </Link>
                                </FieldDescription>
                            </FieldStack>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-1 text-center text-xs leading-relaxed text-muted-foreground/90 sm:px-4">
                By continuing, you agree to our{' '}
                <span className="text-muted-foreground">Terms</span> and{' '}
                <span className="text-muted-foreground">Privacy Policy</span> — coming soon.
            </FieldDescription>
        </div>
    );
}
