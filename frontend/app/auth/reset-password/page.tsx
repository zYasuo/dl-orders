import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form';

export default function ResetPasswordPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reset password</CardTitle>
                <CardDescription>We will send instructions to your registered email.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <ResetPasswordForm />
                <p className="text-center text-sm text-muted-foreground">
                    <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                        Back to sign in
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
