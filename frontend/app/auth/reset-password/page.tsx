import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetPasswordForm } from '@/modules/auth/components/reset-password-form';

export default function ResetPasswordPage() {
    return (
        <div className="mx-auto w-full max-w-md">
            <Card>
                <CardHeader>
                    <CardTitle>Recuperar senha</CardTitle>
                    <CardDescription>Enviaremos instruções para o e-mail cadastrado.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <ResetPasswordForm />
                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
                            Voltar ao login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
