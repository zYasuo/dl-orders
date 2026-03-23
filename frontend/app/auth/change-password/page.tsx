import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangePasswordForm } from '@/modules/auth/components/change-password-form';

export default function ChangePasswordPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Nova senha</CardTitle>
                <CardDescription>Use o token recebido por e-mail.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-56" />}>
                    <ChangePasswordForm />
                </Suspense>
            </CardContent>
        </Card>
    );
}
