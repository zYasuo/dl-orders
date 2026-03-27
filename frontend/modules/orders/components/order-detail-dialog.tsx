'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrencyBRL } from '@/lib/utils';
import { formatRelativeEn } from '@/lib/format/format-relative-pt';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/types/order';

function orderLabel(order: Order) {
    if (order.sequenceId != null) {
        return `#${order.sequenceId}`;
    }
    return `#${order.id.slice(0, 8)}`;
}

function summarizeText(text: string, max = 160) {
    const t = text.trim();
    if (t.length <= max) {
        return t;
    }
    return `${t.slice(0, max).trim()}…`;
}

type OrderDetailDialogProps = {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function OrderDetailDialog({ order, open, onOpenChange }: OrderDetailDialogProps) {
    const { toast } = useToast();

    async function handleCopyId() {
        if (!order) return;
        try {
            await navigator.clipboard.writeText(order.id);
            toast({ message: 'Order ID copied to clipboard.', variant: 'success' });
        } catch {
            toast({ message: 'Could not copy.', variant: 'error' });
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {order ? (
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Order {orderLabel(order)}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Order details including status, product and pricing.
                    </DialogDescription>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-6">
                        <section className="space-y-2" aria-labelledby="order-detail-summary">
                            <h3 id="order-detail-summary" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Summary
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <OrderStatusBadge status={order.status} />
                                <span className="text-sm text-muted-foreground">{formatRelativeEn(order.createdAt)}</span>
                            </div>
                        </section>
                        <section className="space-y-2" aria-labelledby="order-detail-product">
                            <h3 id="order-detail-product" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Product
                            </h3>
                            <p className="font-medium text-foreground">{order.productName || '—'}</p>
                            {order.productDescription ? (
                                <p className="text-sm leading-relaxed text-muted-foreground">{summarizeText(order.productDescription, 280)}</p>
                            ) : null}
                            {order.description ? (
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Note: </span>
                                    {summarizeText(order.description, 200)}
                                </p>
                            ) : null}
                        </section>
                        <section className="space-y-2" aria-labelledby="order-detail-values">
                            <h3 id="order-detail-values" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Pricing
                            </h3>
                            <p className="text-sm text-foreground">
                                {formatCurrencyBRL(order.unitPrice)} × {order.quantity} ={' '}
                                <span className="font-semibold">{formatCurrencyBRL(order.totalPrice)}</span>
                            </p>
                        </section>
                        <section className="space-y-2" aria-labelledby="order-detail-recipient">
                            <h3 id="order-detail-recipient" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Delivery / recipient
                            </h3>
                            <p className="text-sm text-foreground">{order.recipient}</p>
                        </section>
                        <details className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm">
                            <summary className="cursor-pointer select-none font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                Metadata
                            </summary>
                            <dl className="mt-4 grid gap-3 text-xs text-muted-foreground">
                                <div>
                                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">ID</dt>
                                    <dd className="mt-1 break-all font-mono text-foreground/90">{order.id}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">Idempotency key</dt>
                                    <dd className="mt-1 break-all font-mono text-foreground/90">{order.idempotencyKey}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">Product ID</dt>
                                    <dd className="mt-1 break-all font-mono text-foreground/90">{order.productId}</dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">Created</dt>
                                    <dd className="mt-1 text-foreground/90">
                                        {new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.createdAt))}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/90">Updated</dt>
                                    <dd className="mt-1 text-foreground/90">
                                        {new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(order.updatedAt))}
                                    </dd>
                                </div>
                            </dl>
                        </details>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => void handleCopyId()}>
                        Copy order ID
                    </Button>
                </DialogFooter>
            </DialogContent>
            ) : null}
        </Dialog>
    );
}
