import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderDetailsPort } from '../../domain/ports/order-details.port';
import { PaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export type TPaymentByOrderResult = {
  paymentId: string;
  orderId: string;
  status: string;
  amount: number;
  initPoint: string | null;
};

@Injectable()
export class FindPaymentByOrderIdUseCase {
  constructor(
    private readonly paymentRepositoryPort: PaymentRepositoryPort,
    private readonly orderDetailsPort: OrderDetailsPort,
  ) {}

  async execute(orderId: string, bearerToken: string): Promise<TPaymentByOrderResult> {
    const order = await this.orderDetailsPort.getByOrderId(orderId, { bearerToken });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const payment = await this.paymentRepositoryPort.findByOrderId(orderId);

    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }

    return {
      paymentId: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      initPoint: payment.getInitPoint(),
    };
  }
}
