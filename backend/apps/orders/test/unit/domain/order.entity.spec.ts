import { DomainError } from '@app/shared/domain';
import { OrderEntity, OrderStatus } from '../../../src/domain/entities/order.entity';

describe('OrderEntity', () => {
  const validParams = {
    productId: 'product-123',
    quantity: 2,
    description: 'test order',
    recipient: 'test@example.com',
    productName: 'Product A',
    productDescription: 'A great product',
    idempotencyKey: crypto.randomUUID(),
    unitPrice: 99.9,
  };

  describe('create', () => {
    it('creates an order with PENDING status and calculates totalPrice', () => {
      const order = OrderEntity.create(validParams);

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.quantity).toBe(2);
      expect(order.unitPrice).toBe(99.9);
      expect(order.totalPrice).toBeCloseTo(199.8);
      expect(order.id).toBeDefined();
    });

    it('throws on invalid recipient email', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, recipient: 'not-an-email' }),
      ).toThrow(DomainError);
    });

    it('throws on zero quantity', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, quantity: 0 }),
      ).toThrow(DomainError);
    });

    it('throws on negative unitPrice', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, unitPrice: -10 }),
      ).toThrow(DomainError);
    });

    it('throws on empty productId', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, productId: '' }),
      ).toThrow(DomainError);
    });

    it('throws on empty description', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, description: '' }),
      ).toThrow(DomainError);
    });

    it('throws on empty idempotencyKey', () => {
      expect(() =>
        OrderEntity.create({ ...validParams, idempotencyKey: '' }),
      ).toThrow(DomainError);
    });
  });

  describe('confirm', () => {
    it('transitions from PENDING to CONFIRMED', () => {
      const order = OrderEntity.create(validParams);
      const confirmed = order.confirm();

      expect(confirmed.status).toBe(OrderStatus.CONFIRMED);
      expect(confirmed.id).toBe(order.id);
    });

    it('throws when confirming a non-PENDING order', () => {
      const order = OrderEntity.create(validParams);
      const confirmed = order.confirm();

      expect(() => confirmed.confirm()).toThrow(DomainError);
    });
  });

  describe('cancel', () => {
    it('transitions from PENDING to CANCELLED', () => {
      const order = OrderEntity.create(validParams);
      const cancelled = order.cancel();

      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
      expect(cancelled.id).toBe(order.id);
    });

    it('throws when cancelling a non-PENDING order', () => {
      const order = OrderEntity.create(validParams);
      const confirmed = order.confirm();

      expect(() => confirmed.cancel()).toThrow(DomainError);
    });
  });

  describe('status predicates', () => {
    it('isPending returns true for new orders', () => {
      const order = OrderEntity.create(validParams);
      expect(order.isPending()).toBe(true);
      expect(order.isConfirmed()).toBe(false);
      expect(order.isCancelled()).toBe(false);
    });
  });
});
