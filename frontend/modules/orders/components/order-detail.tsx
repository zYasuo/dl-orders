'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyBRL } from '@/lib/utils';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import { useOrder } from '@/modules/orders/hooks/use-order';
import { usePaymentByOrder } from '@/modules/payments/hooks/use-payment-by-order';
import { ApiError } from '@/types/api';
import type { PaymentStatus } from '@/types/payment';

const paymentLabels: Record<PaymentStatus, string> = {
    PENDING: 'Pagamento pendente',
    APPROVED: 'Pagamento aprovado',
    REJECTED: 'Pagamento recusado',
    CANCELLED: 'Pagamento cancelado',
    REFUNDED: 'Reembolsado',
};

export function OrderDetail({ orderId }: { orderId: string }) {
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get('payment_status');

    const { data: order, isLoading, isError, error } = useOrder(orderId, { pollWhilePending: true });

    const showPayment = order?.status === 'PENDING';
    const { data: payment, isLoading: payLoading } = usePaymentByOrder(orderId, showPayment);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-64" />
                <Skeleton variant="card" className="h-48" />
            </div>
        );
    }

    if (isError || !order) {
        const msg = error instanceof ApiError ? error.message : 'Pedido não encontrado.';
        return <Alert variant="error">{msg}</Alert>;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold">Pedido</h1>
                <OrderStatusBadge status={order.status} />
            </div>

            {paymentStatus === 'failure' ? <Alert variant="error">Pagamento não concluído ou recusado.</Alert> : null}
            {paymentStatus === 'pending' ? <Alert variant="warning">Pagamento em análise. Atualizando status…</Alert> : null}
            {paymentStatus === 'success' && order.status === 'CONFIRMED' ? (
                <Alert variant="success">Pagamento confirmado. Pedido concluído.</Alert>
            ) : null}

            <Card>
                <CardHeader>
                    <CardTitle>{order.productName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                    <p className="text-muted-foreground">{order.productDescription}</p>
                    <p>
                        Quantidade: <strong>{order.quantity}</strong>
                    </p>
                    <p>
                        Unitário: <strong>{formatCurrencyBRL(order.unitPrice)}</strong>
                    </p>
                    <p>
                        Total: <strong>{formatCurrencyBRL(order.totalPrice)}</strong>
                    </p>
                    <p>
                        Destinatário: <strong>{order.recipient}</strong>
                    </p>
                    <p>
                        Observação: <strong>{order.description}</strong>
                    </p>
                </CardContent>
            </Card>

            {order.status === 'PENDING' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {payLoading ? <Skeleton className="h-10 w-full" /> : null}
                        {payment ? (
                            <>
                                <p className="text-sm text-muted-foreground">{paymentLabels[payment.status]}</p>
                                {payment.initPoint ? (
                                    <a
                                        href={payment.initPoint}
                                        rel="noopener noreferrer"
                                        className={cn(buttonVariants({ variant: 'primary', size: 'md' }))}
                                    >
                                        Pagar com Mercado Pago
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Link de pagamento ainda não disponível. Aguarde alguns segundos e atualize a página.
                                    </p>
                                )}
                            </>
                        ) : !payLoading ? (
                            <p className="text-sm text-muted-foreground">Não foi possível carregar o pagamento.</p>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {order.status === 'CANCELLED' ? <Alert variant="warning">Este pedido foi cancelado.</Alert> : null}

            <Link href="/products" className="text-sm text-primary underline-offset-4 hover:underline">
                Voltar ao catálogo
            </Link>
        </div>
    );
}
