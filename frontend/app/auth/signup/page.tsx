import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from '@/modules/auth/components/signup-form';

export default function SignupPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>Enter your details. We will email you a verification code.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <SignupForm />
                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                        Sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
