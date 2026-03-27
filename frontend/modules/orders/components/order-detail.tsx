'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Alert } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrencyBRL } from '@/lib/utils';
import { CopyOrderIdButton } from '@/modules/orders/components/copy-order-id-button';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import { useOrder } from '@/modules/orders/hooks/use-order';
import { usePaymentByOrder } from '@/modules/payments/hooks/use-payment-by-order';
import { ApiError } from '@/types/api';
import type { PaymentStatus } from '@/types/payment';

const paymentLabels: Record<PaymentStatus, string> = {
    PENDING: 'Payment pending',
    APPROVED: 'Payment approved',
    REJECTED: 'Payment rejected',
    CANCELLED: 'Payment cancelled',
    REFUNDED: 'Refunded',
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
        const msg = error instanceof ApiError ? error.message : 'Order not found.';
        return (
            <div className="flex flex-col gap-4">
                <Alert variant="error">{msg}</Alert>
                <Link href="/products" className="text-sm text-primary underline-offset-4 hover:underline">
                    Back to catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col gap-4 border-b border-border pb-6">
                <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Order confirmed</h1>
                    <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-muted-foreground">Order number</p>
                    <code className="rounded bg-muted px-2 py-1 text-sm font-mono text-foreground">{order.id}</code>
                    <CopyOrderIdButton orderId={order.id} />
                </div>
                <div aria-live="polite">
                    {order.status === 'PENDING' ? (
                        <Alert variant="success">
                            Order placed successfully. Next step: complete payment with Mercado Pago. You’ll get an email when the order is confirmed.
                        </Alert>
                    ) : null}
                    {order.status === 'CONFIRMED' ? (
                        <Alert variant="success">Payment confirmed. Order complete. Thank you for your purchase.</Alert>
                    ) : null}
                </div>
            </header>

            <div aria-live="polite" className="flex flex-col gap-3">
                {paymentStatus === 'failure' ? <Alert variant="error">Payment was not completed or was declined.</Alert> : null}
                {paymentStatus === 'pending' ? <Alert variant="warning">Payment under review. Updating status…</Alert> : null}
                {paymentStatus === 'success' && order.status === 'CONFIRMED' ? (
                    <Alert variant="success">Payment return: success. Order complete.</Alert>
                ) : null}
            </div>

            <section aria-labelledby="order-next-steps" className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                <h2 id="order-next-steps" className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Next steps
                </h2>
                <ol className="list-inside list-decimal space-y-1.5 text-sm text-foreground">
                    <li>
                        {order.status === 'PENDING'
                            ? 'Use the button below to pay with Mercado Pago.'
                            : order.status === 'CONFIRMED'
                              ? 'Your payment has already been confirmed.'
                              : 'Follow the order status above.'}
                    </li>
                    <li>Wait for confirmation — this page refreshes automatically while the order is pending.</li>
                    <li>You’ll receive an email when the order is confirmed.</li>
                </ol>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-semibold leading-snug">{order.productName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                    <p className="text-muted-foreground">{order.productDescription}</p>
                    <p>
                        Quantity: <strong className="font-medium text-foreground">{order.quantity}</strong>
                    </p>
                    <p>
                        Unit price: <strong className="font-medium text-foreground tabular-nums">{formatCurrencyBRL(order.unitPrice)}</strong>
                    </p>
                    <p>
                        Total: <strong className="font-medium text-foreground tabular-nums">{formatCurrencyBRL(order.totalPrice)}</strong>
                    </p>
                    <p>
                        Recipient: <strong className="font-medium text-foreground">{order.recipient}</strong>
                    </p>
                    <div className="space-y-1">
                        <p className="text-muted-foreground">Order notes and delivery</p>
                        <p className="whitespace-pre-wrap wrap-break-word text-foreground">{order.description}</p>
                    </div>
                </CardContent>
            </Card>

            {order.status === 'PENDING' ? (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Payment</CardTitle>
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
                                        Pay with Mercado Pago
                                    </a>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Payment link not ready yet. Wait a few seconds and refresh the page.
                                    </p>
                                )}
                            </>
                        ) : !payLoading ? (
                            <p className="text-sm text-muted-foreground">Could not load payment details.</p>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}

            {order.status === 'CANCELLED' ? (
                <Alert variant="warning">
                    This order was cancelled. That can happen if the product ran out of stock or another purchase used the last units after you started
                    checkout. Check the catalog and try again if the item becomes available.
                </Alert>
            ) : null}

            <Link href="/products" className="text-sm text-primary underline-offset-4 hover:underline">
                Back to catalog
            </Link>
        </div>
    );
}
