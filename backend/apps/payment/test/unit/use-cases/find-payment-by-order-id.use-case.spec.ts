import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FindPaymentByOrderIdUseCase } from '../../../src/application/use-cases/find-payment-by-order-id.use-case';
import { OrderDetailsPort } from '../../../src/domain/ports/order-details.port';
import { PaymentEntity } from '../../../src/domain/entities/payment.entity';
import { PaymentRepositoryPort } from '../../../src/domain/ports/payment-repository.port';

describe('FindPaymentByOrderIdUseCase', () => {
  let sut: FindPaymentByOrderIdUseCase;
  let paymentRepository: jest.Mocked<PaymentRepositoryPort>;
  let orderDetails: jest.Mocked<OrderDetailsPort>;

  const bearer = 'jwt-token';
  const orderId = 'order-1';

  beforeEach(async () => {
    paymentRepository = {
      findByOrderId: jest.fn(),
    } as unknown as jest.Mocked<PaymentRepositoryPort>;

    orderDetails = {
      getByOrderId: jest.fn().mockResolvedValue({
        orderId,
        totalPrice: 100,
        idempotencyKey: null,
      }),
    } as unknown as jest.Mocked<OrderDetailsPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindPaymentByOrderIdUseCase,
        { provide: PaymentRepositoryPort, useValue: paymentRepository },
        { provide: OrderDetailsPort, useValue: orderDetails },
      ],
    }).compile();

    sut = module.get(FindPaymentByOrderIdUseCase);
  });

  it('returns payment when order is visible to the user and payment exists', async () => {
    const payment = PaymentEntity.create({ orderId, amount: 100 });
    paymentRepository.findByOrderId.mockResolvedValue(payment);

    const result = await sut.execute(orderId, bearer);

    expect(orderDetails.getByOrderId).toHaveBeenCalledWith(orderId, { bearerToken: bearer });
    expect(result.paymentId).toBe(payment.id);
  });

  it('throws NotFound when order is not found for user', async () => {
    orderDetails.getByOrderId.mockResolvedValueOnce(null);

    await expect(sut.execute(orderId, bearer)).rejects.toThrow(NotFoundException);
    expect(paymentRepository.findByOrderId).not.toHaveBeenCalled();
  });

  it('propagates Forbidden when orders rejects access', async () => {
    orderDetails.getByOrderId.mockRejectedValueOnce(new ForbiddenException('Forbidden'));

    await expect(sut.execute(orderId, bearer)).rejects.toThrow(ForbiddenException);
    expect(paymentRepository.findByOrderId).not.toHaveBeenCalled();
  });

  it('throws NotFound when payment record missing', async () => {
    paymentRepository.findByOrderId.mockResolvedValueOnce(null);

    await expect(sut.execute(orderId, bearer)).rejects.toThrow(
      new NotFoundException(`Payment for order ${orderId} not found`),
    );
  });
});
