import { z } from 'zod';

export const checkoutSchema = z.object({
    quantity: z.coerce.number().int('Quantidade inválida').min(1, 'Mínimo 1'),
    description: z.string().min(1, 'Informe uma descrição do pedido'),
    recipient: z.string().email('E-mail do destinatário inválido'),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
