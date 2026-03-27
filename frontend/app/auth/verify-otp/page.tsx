import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OtpForm } from '@/modules/auth/components/otp-form';

export default function VerifyOtpPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Verify email</CardTitle>
                <CardDescription>Enter the 6-digit code sent to your email.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-40" />}>
                    <OtpForm />
                </Suspense>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
                        Back to sign up
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
