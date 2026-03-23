import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SignupForm } from '@/modules/auth/components/signup-form';

export default function SignupPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Criar conta</CardTitle>
                <CardDescription>Informe seus dados. Enviaremos um código por e-mail.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <SignupForm />
                <p className="text-center text-sm text-muted-foreground">
                    Já tem conta?{' '}
                    <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                        Entrar
                    </Link>
                </p>
            </CardContent>
        </Card>
    );
}
