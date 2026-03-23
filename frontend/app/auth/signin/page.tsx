import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SigninForm } from '@/modules/auth/components/signin-form';

export default function SigninPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Entrar</CardTitle>
                <CardDescription>Use o e-mail e a senha da sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<Skeleton className="h-48" />}>
                    <SigninForm />
                </Suspense>
            </CardContent>
        </Card>
    );
}
