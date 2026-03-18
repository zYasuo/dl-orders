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
    const response = await fetch(url);

    const { status, ok } = response;

    if (status === 404) return null;

    if (!ok) {
      throw new Error(`Orders service returned ${status}: ${await response.text()}`);
    }

    const body = (await response.json()) as {
      id?: string;
      totalPrice?: number;
      idempotencyKey?: string | null;
    };
    const totalPrice = typeof body.totalPrice === 'number' ? body.totalPrice : undefined;

    if (totalPrice === undefined) {
      throw new Error('Orders service contract mismatch: expected totalPrice (number).');
    }

    return {
      orderId: body.id ?? orderId,
      totalPrice,
      idempotencyKey: typeof body.idempotencyKey === 'string' ? body.idempotencyKey : null,
    };
  }
}
