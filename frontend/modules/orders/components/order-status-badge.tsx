import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@/types/order';

const labelsEn: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
};

const labelsPt: Record<OrderStatus, string> = {
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    CANCELLED: 'Cancelado',
};

const variants: Record<OrderStatus, 'pending' | 'confirmed' | 'cancelled' | 'default'> = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
};

export function OrderStatusBadge({ status, locale = 'en' }: { status: OrderStatus; locale?: 'en' | 'pt' }) {
    const labels = locale === 'pt' ? labelsPt : labelsEn;
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}
