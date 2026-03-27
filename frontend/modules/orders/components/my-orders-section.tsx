'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrencyBRL, cn } from '@/lib/utils';
import { formatRelativeEn } from '@/lib/format-relative-pt';
import { OrderDetailDialog } from '@/modules/orders/components/order-detail-dialog';
import { OrderStatusBadge } from '@/modules/orders/components/order-status-badge';
import { useOrdersList } from '@/modules/orders/hooks/use-orders-list';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/types/api';
import type { Order } from '@/types/order';

const PAGE_SIZE = 10;

function orderLabel(order: Order) {
    if (order.sequenceId != null) {
        return `#${order.sequenceId}`;
    }
    return `#${order.id.slice(0, 8)}`;
}

function OrdersTableSkeleton() {
    return (
        <div className="space-y-3" aria-busy="true" aria-label="Loading orders">
            <div className="hidden md:block">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="mt-2 h-12 w-full rounded-md" />
                <Skeleton className="mt-1 h-12 w-full rounded-md" />
                <Skeleton className="mt-1 h-12 w-full rounded-md" />
            </div>
            <div className="space-y-2 md:hidden">
                <Skeleton className="h-28 w-full rounded-xl border border-border" />
                <Skeleton className="h-28 w-full rounded-xl border border-border" />
            </div>
        </div>
    );
}

type OrderActionsProps = {
    order: Order;
    onViewDetails: (order: Order) => void;
};

function OrderRowActions({ order, onViewDetails }: OrderActionsProps) {
    const { toast } = useToast();

    async function copyId() {
        try {
            await navigator.clipboard.writeText(order.id);
            toast({ message: 'ID copied.', variant: 'success' });
        } catch {
            toast({ message: 'Could not copy.', variant: 'error' });
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    aria-label={`Order ${orderLabel(order)} actions`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(order);
                    }}
                >
                    View details
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation();
                        void copyId();
                    }}
                >
                    Copy ID
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function MyOrdersSection() {
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<Order | null>(null);
    const { data, isLoading, isError, error, refetch, isFetching } = useOrdersList(page, PAGE_SIZE);

    const orders = data?.orders ?? [];
    const meta = data?.meta;
    const totalPages = meta?.totalPages ?? 1;

    function openDetail(order: Order) {
        setSelected(order);
    }

    function closeDetail(open: boolean) {
        if (!open) {
            setSelected(null);
        }
    }

    return (
        <>
            <Card className="overflow-hidden border-border sm:col-span-2">
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle className="text-base">My orders</CardTitle>
                            <CardDescription className="text-pretty">
                                Tap a row or View to open order details.
                            </CardDescription>
                        </div>
                        {meta && meta.total > 0 ? (
                            <p className="text-sm text-muted-foreground">
                                {meta.total} {meta.total === 1 ? 'order' : 'orders'}
                                {isFetching && !isLoading ? <span className="ml-2 text-xs">(refreshing…)</span> : null}
                            </p>
                        ) : null}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {isLoading ? <OrdersTableSkeleton /> : null}

                    {isError ? (
                        <Alert variant="error" className="mb-4">
                            <span className="block">
                                {error instanceof ApiError ? error.message : 'Could not load orders.'}
                            </span>
                            <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={() => void refetch()}>
                                Try again
                            </Button>
                        </Alert>
                    ) : null}

                    {!isLoading && !isError && orders.length === 0 ? (
                        <EmptyState
                            title="No orders yet"
                            description="When you complete a purchase, your orders will show up here."
                            action={
                                <Link href="/products" className={buttonVariants({ variant: 'secondary' })}>
                                    Browse store
                                </Link>
                            }
                            className="border-border bg-muted/20"
                        />
                    ) : null}

                    {!isLoading && !isError && orders.length > 0 ? (
                        <>
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Order</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead className="w-24 text-right">Qty</TableHead>
                                            <TableHead className="w-32 text-right">Total</TableHead>
                                            <TableHead className="w-36">Status</TableHead>
                                            <TableHead className="min-w-[120px]">Date</TableHead>
                                            <TableHead className="w-20 text-right">
                                                <span className="sr-only">Actions</span>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow
                                                key={order.id}
                                                className={cn('cursor-pointer hover:bg-muted/40')}
                                                tabIndex={0}
                                                onClick={() => openDetail(order)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        openDetail(order);
                                                    }
                                                }}
                                                aria-label={`Order ${orderLabel(order)}, ${order.productName}. View details.`}
                                            >
                                                <TableCell className="font-mono text-sm font-medium text-foreground">
                                                    {orderLabel(order)}
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <span className="line-clamp-2 text-foreground">{order.productName || '—'}</span>
                                                </TableCell>
                                                <TableCell className="text-right tabular-nums text-muted-foreground">
                                                    {order.quantity}
                                                </TableCell>
                                                <TableCell className="text-right font-medium tabular-nums text-foreground">
                                                    {formatCurrencyBRL(order.totalPrice)}
                                                </TableCell>
                                                <TableCell>
                                                    <OrderStatusBadge status={order.status} />
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    <time dateTime={order.createdAt}>{formatRelativeEn(order.createdAt)}</time>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-primary hover:text-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDetail(order);
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                        <OrderRowActions order={order} onViewDetails={openDetail} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <ul className="space-y-3 md:hidden" aria-label="Orders list">
                                {orders.map((order) => (
                                    <li key={order.id}>
                                        <div className="overflow-hidden rounded-xl border border-border bg-card">
                                            <button
                                                type="button"
                                                className="flex w-full flex-col gap-3 p-4 pb-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                onClick={() => openDetail(order)}
                                                aria-label={`Order ${orderLabel(order)}, ${order.productName ?? 'product'}. View details.`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-mono text-sm font-semibold text-foreground">{orderLabel(order)}</p>
                                                        <p className="mt-1 line-clamp-2 text-sm text-foreground">{order.productName || '—'}</p>
                                                    </div>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                                    <span className="tabular-nums text-muted-foreground">Qty {order.quantity}</span>
                                                    <span className="font-medium tabular-nums text-foreground">
                                                        {formatCurrencyBRL(order.totalPrice)}
                                                    </span>
                                                </div>
                                            </button>
                                            <div className="flex items-center justify-between gap-2 border-t border-border px-4 pb-4 pt-3">
                                                <button
                                                    type="button"
                                                    className="text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                                                    onClick={() => openDetail(order)}
                                                    aria-label={`Order ${orderLabel(order)} date, open details`}
                                                >
                                                    <time dateTime={order.createdAt}>{formatRelativeEn(order.createdAt)}</time>
                                                </button>
                                                <OrderRowActions order={order} onViewDetails={openDetail} />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {totalPages > 1 ? (
                                <nav
                                    className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
                                    aria-label="Orders pagination"
                                >
                                    <p className="text-sm text-muted-foreground">
                                        Page {meta?.page ?? page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={page <= 1 || isFetching}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages || isFetching}
                                            onClick={() => setPage((p) => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </nav>
                            ) : null}
                        </>
                    ) : null}
                </CardContent>
            </Card>

            <OrderDetailDialog order={selected} open={selected !== null} onOpenChange={closeDetail} />
        </>
    );
}
