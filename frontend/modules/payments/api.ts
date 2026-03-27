import { bffJson } from '@/lib/http/bff-client';
import type { PaymentByOrder } from '@/types/payment';

export async function getPaymentByOrder(orderId: string) {
    return bffJson<PaymentByOrder>(`/api/payments/order/${orderId}`);
}
