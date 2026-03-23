import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckoutForm } from '@/modules/orders/components/checkout-form';

export default function CheckoutPage() {
    return (
        <div className="mx-auto w-full max-w-lg">
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    <CardDescription>Revise quantidade e dados. O pedido usa uma chave de idempotência para evitar duplicidade.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<Skeleton className="h-64" />}>
                        <CheckoutForm />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
