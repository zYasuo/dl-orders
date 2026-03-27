'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/modules/auth/hooks/use-session';
import { buildCheckoutSchema, composeOrderDescription, type CheckoutFormValues } from '@/modules/orders/schemas/checkout.schema';
import { useCreateOrder } from '@/modules/orders/hooks/use-create-order';
import { cancelCartAbandonment } from '@/lib/cart-abandonment-schedule';
import { removeCartLine } from '@/lib/cart-storage';
import { cn, formatCurrencyBRL } from '@/lib/utils';
import { ApiError } from '@/types/api';

const fieldLabelShell = '[&_label]:text-[11px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-[0.06em] [&_label]:text-muted-foreground';

const inputClass = 'rounded-xl border-black/[0.08] dark:border-border';

const textareaClass = cn(
    'flex min-h-[5.5rem] w-full rounded-xl border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:cursor-not-allowed disabled:opacity-50',
);

function quantityForDisplay(raw: unknown, maxStock: number | null): number {
    if (raw === '' || raw === null || raw === undefined) {
        return 1;
    }
    const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
    if (!Number.isFinite(n) || n < 1) {
        return 1;
    }
    let q = Math.trunc(n);
    if (maxStock !== null && maxStock > 0 && q > maxStock) {
        q = maxStock;
    }
    return q;
}

export type CheckoutProductPreview = {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
};

export function CheckoutForm({
    product,
    maxStock,
    initialQuantity,
}: {
    product: CheckoutProductPreview | null;
    maxStock: number | null;
    initialQuantity?: number;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId') ?? '';
    const { toast } = useToast();
    const { data: user, isPending: sessionPending, isFetched } = useSession();
    const createOrder = useCreateOrder();
    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

    const schema = useMemo(() => buildCheckoutSchema(maxStock), [maxStock]);
    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            quantity: initialQuantity ?? 1,
            notes: '',
            recipient: '',
            deliveryFullName: '',
            deliveryLine1: '',
            deliveryLine2: '',
            deliveryCity: '',
            deliveryState: '',
            deliveryPostalCode: '',
            deliveryCountry: '',
        },
    });

    const quantityRaw = useWatch({ control: form.control, name: 'quantity', defaultValue: initialQuantity ?? 1 });
    const quantity = useMemo(
        () => quantityForDisplay(quantityRaw, maxStock),
        [quantityRaw, maxStock],
    );
    const needsSignIn = isFetched && !user;
    const signInReturn = `/checkout?${searchParams.toString()}`;
    const signInHref = `/auth/signin?returnUrl=${encodeURIComponent(signInReturn.startsWith('/') ? signInReturn : '/checkout')}`;

    useEffect(() => {
        if (user?.email) {
            form.setValue('recipient', user.email);
        }
    }, [user?.email, form]);

    useEffect(() => {
        form.clearErrors('quantity');
        if (maxStock !== null && maxStock > 0) {
            const raw = form.getValues('quantity');
            const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10);
            if (Number.isFinite(n) && n > maxStock) {
                form.setValue('quantity', maxStock);
            }
        }
    }, [maxStock, form]);

    const lineTotal = useMemo(() => {
        if (!product || quantity < 1) {
            return null;
        }
        return product.price * quantity;
    }, [product, quantity]);

    async function onSubmit(values: CheckoutFormValues) {
        if (!productId) {
            toast({ message: 'Invalid product. Return to the catalog.', variant: 'error' });
            return;
        }
        const description = composeOrderDescription(values);
        const key = idempotencyKey ?? crypto.randomUUID();
        if (!idempotencyKey) {
            setIdempotencyKey(key);
        }
        try {
            const order = await createOrder.mutateAsync({
                productId,
                quantity: values.quantity,
                description,
                recipient: values.recipient,
                idempotencyKey: key,
            });
            removeCartLine(productId);
            window.dispatchEvent(new Event('dl-orders-cart'));
            void cancelCartAbandonment();
            toast({ message: 'Order placed.', variant: 'success' });
            router.push(`/orders/${order.id}`);
        } catch (e) {
            let msg = e instanceof ApiError ? e.message : 'Could not create the order.';
            if (
                e instanceof ApiError &&
                (e.statusCode === 409 || e.statusCode === 400) &&
                /stock|estoque|inventory|quantidade|quantity/i.test(msg)
            ) {
                msg = 'The requested quantity is no longer available. Refresh the page and try again with fewer units.';
            }
            toast({ message: msg, variant: 'error' });
        }
    }

    if (!productId) {
        return (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
                No product selected. Pick an item in the{' '}
                <Link
                    href="/products"
                    className="text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
                >
                    catalog
                </Link>
                .
            </p>
        );
    }

    if (maxStock !== null && maxStock === 0) {
        return (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
                This product is out of stock.{' '}
                <Link href="/products" className="text-foreground underline-offset-4 transition-colors duration-200 hover:underline">
                    Back to catalog
                </Link>
                .
            </p>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-14">
            <aside className="order-1 mb-10 lg:sticky lg:top-24 lg:order-2 lg:mb-0">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Order summary</h2>
                    {product ? (
                        <div className="mt-4 flex gap-4">
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground/50">—</div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="text-sm font-medium leading-snug text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrencyBRL(product.price)} × {quantity}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-muted-foreground">Product could not be loaded.</p>
                    )}
                    <Field
                        label="Quantity"
                        htmlFor="quantity"
                        className={cn('mt-6', fieldLabelShell)}
                        error={form.formState.errors.quantity?.message}
                    >
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            max={maxStock !== null && maxStock > 0 ? maxStock : undefined}
                            step={1}
                            className={inputClass}
                            disabled={!product}
                            {...form.register('quantity')}
                        />
                    </Field>
                    <div className="mt-6 space-y-1 border-t border-border pt-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="tabular-nums text-foreground">
                                {lineTotal !== null ? formatCurrencyBRL(lineTotal) : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Shipping</span>
                            <span className="text-foreground/70">Calculated later</span>
                        </div>
                        <div className="flex justify-between pt-2 text-base font-semibold text-foreground">
                            <span>Total</span>
                            <span className="tabular-nums">{lineTotal !== null ? formatCurrencyBRL(lineTotal) : '—'}</span>
                        </div>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        Totals reflect this demo catalog only. Taxes or shipping are not calculated in this study app.
                    </p>
                </div>
            </aside>

            <div className="order-2 flex min-w-0 flex-col gap-10 lg:order-1">
                <input type="hidden" name="productId" value={productId} readOnly aria-hidden />

                {sessionPending && !isFetched ? (
                    <p className="text-sm text-muted-foreground">Loading account…</p>
                ) : needsSignIn ? (
                    <div
                        className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground"
                        role="status"
                    >
                        <p className="font-medium">Sign in required</p>
                        <p className="mt-1 text-muted-foreground">
                            You need an account to place an order.{' '}
                            <Link href={signInHref} className="underline-offset-4 hover:underline">
                                Sign in
                            </Link>{' '}
                            to continue checkout.
                        </p>
                    </div>
                ) : user ? (
                    <section aria-labelledby="checkout-account-heading" className="space-y-3">
                        <h2 id="checkout-account-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            Your account
                        </h2>
                        <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                            {user.name ? <p className="font-medium text-foreground">{user.name}</p> : null}
                            <p className="text-muted-foreground">{user.email}</p>
                            <Link href="/account" className="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline">
                                Edit profile
                            </Link>
                        </div>
                    </section>
                ) : null}

                <section aria-labelledby="checkout-delivery-heading" className="space-y-4">
                    <div>
                        <h2 id="checkout-delivery-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            Delivery
                        </h2>
                        <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                            Required shipping details. They are stored in your order record (single description field until a dedicated
                            address API exists).
                        </p>
                    </div>
                    <Field
                        label="Full name"
                        htmlFor="deliveryFullName"
                        className={fieldLabelShell}
                        error={form.formState.errors.deliveryFullName?.message}
                    >
                        <Input id="deliveryFullName" className={inputClass} autoComplete="name" {...form.register('deliveryFullName')} />
                    </Field>
                    <Field
                        label="Address line 1"
                        htmlFor="deliveryLine1"
                        className={fieldLabelShell}
                        error={form.formState.errors.deliveryLine1?.message}
                    >
                        <Input id="deliveryLine1" className={inputClass} autoComplete="address-line1" {...form.register('deliveryLine1')} />
                    </Field>
                    <Field
                        label="Address line 2"
                        htmlFor="deliveryLine2"
                        className={fieldLabelShell}
                        error={form.formState.errors.deliveryLine2?.message}
                    >
                        <Input id="deliveryLine2" className={inputClass} autoComplete="address-line2" {...form.register('deliveryLine2')} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="City"
                            htmlFor="deliveryCity"
                            className={fieldLabelShell}
                            error={form.formState.errors.deliveryCity?.message}
                        >
                            <Input id="deliveryCity" className={inputClass} autoComplete="address-level2" {...form.register('deliveryCity')} />
                        </Field>
                        <Field
                            label="State / region"
                            htmlFor="deliveryState"
                            className={fieldLabelShell}
                            error={form.formState.errors.deliveryState?.message}
                        >
                            <Input id="deliveryState" className={inputClass} {...form.register('deliveryState')} />
                        </Field>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Postal code"
                            htmlFor="deliveryPostalCode"
                            className={fieldLabelShell}
                            error={form.formState.errors.deliveryPostalCode?.message}
                        >
                            <Input
                                id="deliveryPostalCode"
                                className={inputClass}
                                autoComplete="postal-code"
                                {...form.register('deliveryPostalCode')}
                            />
                        </Field>
                        <Field
                            label="Country"
                            htmlFor="deliveryCountry"
                            className={fieldLabelShell}
                            error={form.formState.errors.deliveryCountry?.message}
                        >
                            <Input id="deliveryCountry" className={inputClass} autoComplete="country-name" {...form.register('deliveryCountry')} />
                        </Field>
                    </div>
                </section>

                <section aria-labelledby="checkout-payment-heading" className="space-y-3">
                    <h2 id="checkout-payment-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Payment
                    </h2>
                    <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                        This step does not collect card data. After you confirm, you&apos;ll open the order page where payment is simulated
                        (sandbox) — same flow as before, just clearer in the UI.
                    </p>
                    <div
                        className="rounded-xl border border-border bg-muted/30 px-4 py-3"
                        role="group"
                        aria-label="Payment method"
                    >
                        <div className="flex gap-3">
                            <span
                                className="mt-0.5 size-4 shrink-0 rounded-full border-2 border-primary bg-primary/20"
                                aria-hidden
                            />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground">Pay next: order page</p>
                                <p className="text-xs text-muted-foreground">Card / wallet — handled after the order is created</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section aria-labelledby="checkout-contact-heading" className="space-y-5">
                    <h2 id="checkout-contact-heading" className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        Contact & notes
                    </h2>
                    <Field
                        label="Recipient email"
                        htmlFor="recipient"
                        className={fieldLabelShell}
                        hint="Used for communication about the order."
                        error={form.formState.errors.recipient?.message}
                    >
                        <Input
                            id="recipient"
                            type="email"
                            autoComplete="email"
                            className={inputClass}
                            {...form.register('recipient')}
                        />
                    </Field>
                    <Field label="Order notes" htmlFor="notes" className={fieldLabelShell} error={form.formState.errors.notes?.message}>
                        <textarea id="notes" className={textareaClass} placeholder="Gift message, instructions, or other details" {...form.register('notes')} />
                    </Field>
                </section>

                <details className="group">
                    <summary className="cursor-pointer list-none text-[13px] text-muted-foreground underline-offset-4 outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden">
                        About duplicate protection
                    </summary>
                    <p className="mt-3 max-w-prose text-[13px] leading-relaxed text-muted-foreground">
                        This checkout sends an idempotency key with your order. If the request is retried by the network or your device, the
                        server recognises the same key and avoids creating a duplicate order.
                    </p>
                </details>

                <Button
                    type="submit"
                    loading={form.formState.isSubmitting || createOrder.isPending}
                    className="w-full rounded-full"
                    size="lg"
                    disabled={needsSignIn || !product || sessionPending}
                >
                    Confirm order
                </Button>
            </div>
        </form>
    );
}
