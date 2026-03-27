'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    FieldStack,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { signupSchema, type SignupFormValues } from '@/modules/auth/schemas/auth.schemas';
import { signUp } from '@/modules/auth/api';
import { ApiError } from '@/types/api';

const PASSWORD_HINT_ID = 'signup-password-hint';

type SignupFormProps = {
    className?: string;
};

export function SignupForm({ className }: SignupFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const form = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: { email: '', password: '', name: '' },
    });

    const passwordErrorId = 'signup-password-error';
    const passwordDescribedBy = form.formState.errors.password
        ? `${PASSWORD_HINT_ID} ${passwordErrorId}`
        : PASSWORD_HINT_ID;

    async function onSubmit(values: SignupFormValues) {
        try {
            await signUp({
                email: values.email,
                password: values.password,
                name: values.name?.trim() ? values.name.trim() : undefined,
            });
            const verifyHref = `/auth/verify-otp?email=${encodeURIComponent(values.email)}`;
            toast({
                message: 'Account created. Check your email for the verification code.',
                variant: 'success',
                action: { label: 'Enter code', onClick: () => router.push(verifyHref) },
            });
        } catch (e) {
            let msg = 'Could not sign up.';
            if (e instanceof ApiError) {
                msg = e.statusCode === 409 ? 'Could not complete sign-up.' : e.message;
            }
            toast({ message: msg, variant: 'error' });
        }
    }

    const inputClass =
        'h-11 rounded-xl border-white/10 bg-background/60 text-[15px] shadow-inner shadow-black/20 placeholder:text-muted-foreground/80';

    return (
        <div className={cn('flex flex-col gap-8', className)}>
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
                            Create account
                        </CardTitle>
                        <CardDescription className="mx-auto max-w-xs text-balance text-[15px] leading-relaxed text-muted-foreground">
                            Enter your details. We will email you a verification code.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="px-8 pb-9 pt-7">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-7">
                            <FieldStack className="gap-2.5">
                                <FieldLabel
                                    className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
                                    htmlFor="signup-name"
                                >
                                    Name (optional)
                                </FieldLabel>
                                <Input
                                    id="signup-name"
                                    autoComplete="name"
                                    aria-invalid={!!form.formState.errors.name}
                                    className={inputClass}
                                    {...form.register('name')}
                                />
                                {form.formState.errors.name ? (
                                    <p className="text-xs text-danger" role="alert">
                                        {form.formState.errors.name.message}
                                    </p>
                                ) : null}
                            </FieldStack>
                            <FieldStack className="gap-2.5">
                                <FieldLabel
                                    className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
                                    htmlFor="signup-email"
                                >
                                    Email
                                </FieldLabel>
                                <Input
                                    id="signup-email"
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
                                <FieldLabel
                                    className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
                                    htmlFor="signup-password"
                                >
                                    Password
                                </FieldLabel>
                                <Input
                                    id="signup-password"
                                    type="password"
                                    autoComplete="new-password"
                                    aria-invalid={!!form.formState.errors.password}
                                    aria-describedby={passwordDescribedBy}
                                    className={inputClass}
                                    {...form.register('password')}
                                />
                                <p id={PASSWORD_HINT_ID} className="text-xs leading-relaxed text-muted-foreground">
                                    At least 12 and at most 64 characters. Mix letters, numbers, and symbols for a
                                    stronger password.
                                </p>
                                {form.formState.errors.password ? (
                                    <p id={passwordErrorId} className="text-xs text-danger" role="alert">
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
                                    Create account
                                </Button>
                                <FieldDescription className="text-center text-[15px] text-muted-foreground">
                                    Already have an account?{' '}
                                    <Link
                                        href="/auth/signin"
                                        className="font-semibold text-primary underline-offset-4 outline-none ring-offset-background hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                        Sign in
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
