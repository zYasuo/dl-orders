'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/modules/auth/hooks/use-session';
import { checkoutSchema, type CheckoutFormValues } from '@/modules/orders/schemas/checkout.schema';
import { useCreateOrder } from '@/modules/orders/hooks/use-create-order';
import { ApiError } from '@/types/api';

export function CheckoutForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('productId') ?? '';
    const { toast } = useToast();
    const { data: user } = useSession();
    const createOrder = useCreateOrder();
    const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { quantity: 1, description: '', recipient: '' },
    });

    useEffect(() => {
        if (user?.email) {
            form.setValue('recipient', user.email);
        }
    }, [user?.email, form]);

    async function onSubmit(values: CheckoutFormValues) {
        if (!productId) {
            toast({ message: 'Produto inválido. Volte ao catálogo.', variant: 'error' });
            return;
        }
        const key = idempotencyKey ?? crypto.randomUUID();
        if (!idempotencyKey) {
            setIdempotencyKey(key);
        }
        try {
            const order = await createOrder.mutateAsync({
                productId,
                quantity: values.quantity,
                description: values.description,
                recipient: values.recipient,
                idempotencyKey: key,
            });
            toast({ message: 'Pedido registrado.', variant: 'success' });
            router.push(`/orders/${order.id}`);
        } catch (e) {
            const msg = e instanceof ApiError ? e.message : 'Não foi possível criar o pedido.';
            toast({ message: msg, variant: 'error' });
        }
    }

    if (!productId) {
        return (
            <p className="text-sm text-danger">
                Nenhum produto selecionado. Escolha um item no{' '}
                <Link href="/products" className="underline">
                    catálogo
                </Link>
                .
            </p>
        );
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
            <input type="hidden" name="productId" value={productId} readOnly aria-hidden />
            <Field label="Quantidade" htmlFor="quantity" error={form.formState.errors.quantity?.message}>
                <Input id="quantity" type="number" min={1} step={1} {...form.register('quantity')} />
            </Field>
            <Field label="Descrição do pedido" htmlFor="description" error={form.formState.errors.description?.message}>
                <Input id="description" {...form.register('description')} />
            </Field>
            <Field
                label="E-mail do destinatário"
                htmlFor="recipient"
                hint="Usado para comunicação sobre o pedido."
                error={form.formState.errors.recipient?.message}
            >
                <Input id="recipient" type="email" autoComplete="email" {...form.register('recipient')} />
            </Field>
            <Button type="submit" loading={form.formState.isSubmitting || createOrder.isPending} className="w-full">
                Confirmar pedido
            </Button>
        </form>
    );
}
