import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOrderDetails, IOrderDetailsPort } from '../../../domain/ports/order-details.port';

@Injectable()
export class OrdersHttpClient extends IOrderDetailsPort {
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        super();
        this.baseUrl = this.configService.getOrThrow<string>('ORDERS_SERVICE_URL').replace(/\/$/, '');
    }

    async getByOrderId(orderId: string): Promise<IOrderDetails | null> {
        const url = `${this.baseUrl}/api/v1/orders/${encodeURIComponent(orderId)}`;
        const res = await fetch(url);

        if (res.status === 404) return null;

        if (!res.ok) {
            throw new Error(`Orders service returned ${res.status}: ${await res.text()}`);
        }

        const body = (await res.json()) as { id?: string; totalPrice?: number };
        const totalPrice = typeof body.totalPrice === 'number' ? body.totalPrice : undefined;
        if (totalPrice === undefined) {
            throw new Error('Orders service contract mismatch: expected totalPrice (number).');
        }

        return {
            orderId: body.id ?? orderId,
            totalPrice,
        };
    }
}
