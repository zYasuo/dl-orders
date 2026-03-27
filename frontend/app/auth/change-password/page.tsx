import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordForm } from '@/modules/auth/components/change-password-form';

export default function ChangePasswordPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>New password</CardTitle>
                <CardDescription>Use the token you received by email.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-56" />}>
                    <ChangePasswordForm />
                </Suspense>
            </CardContent>
        </Card>
    );
}
