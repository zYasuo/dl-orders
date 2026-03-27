import { DomainError, Email, Money, Quantity } from '@app/shared/domain';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export type TOrderParams = {
  readonly id: string;
  readonly sequenceId?: number;
  readonly productId: string;
  readonly quantity: number;
  readonly description: string;
  readonly recipient: string;
  readonly productName: string;
  readonly productDescription: string;
  readonly idempotencyKey: string;
  readonly unitPrice: number;
  readonly totalPrice: number;
  status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

type TOrderCreateInput = {
  productId: string;
  quantity: number;
  description: string;
  recipient: string;
  productName: string;
  productDescription: string;
  idempotencyKey: string;
  unitPrice: number;
};

export class OrderEntity {
  constructor(private params: TOrderParams) {}

  static create(params: TOrderCreateInput): OrderEntity {
    OrderEntity.assertRequiredStrings(params);
    Email.create(params.recipient);
    const qty = Quantity.create(params.quantity);
    const unit = Money.create(params.unitPrice);
    const total = unit.multiply(qty.value);

    const now = new Date();

    return new OrderEntity({
      id: crypto.randomUUID(),
      productId: params.productId,
      quantity: qty.value,
      description: params.description,
      recipient: params.recipient,
      productName: params.productName,
      productDescription: params.productDescription ?? '',
      idempotencyKey: params.idempotencyKey,
      unitPrice: unit.value,
      totalPrice: total.value,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  confirm(): OrderEntity {
    if (!this.isPending()) {
      throw new DomainError(`Cannot confirm order in status ${this.params.status}`);
    }

    return new OrderEntity({
      ...this.params,
      status: OrderStatus.CONFIRMED,
      updatedAt: new Date(),
    });
  }

  cancel(): OrderEntity {
    if (!this.isPending()) {
      throw new DomainError(`Cannot cancel order in status ${this.params.status}`);
    }

    return new OrderEntity({
      ...this.params,
      status: OrderStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  get id() {
    return this.params.id;
  }

  get sequenceId() {
    return this.params.sequenceId;
  }

  get productId() {
    return this.params.productId;
  }

  get quantity() {
    return this.params.quantity;
  }

  get description() {
    return this.params.description;
  }

  get idempotencyKey() {
    return this.params.idempotencyKey;
  }

  get recipient() {
    return this.params.recipient;
  }

  get productName() {
    return this.params.productName;
  }

  get productDescription() {
    return this.params.productDescription;
  }

  get unitPrice() {
    return this.params.unitPrice;
  }

  get totalPrice() {
    return this.params.totalPrice;
  }

  get status() {
    return this.params.status;
  }

  get createdAt() {
    return this.params.createdAt;
  }

  get updatedAt() {
    return this.params.updatedAt;
  }

  isPending(): boolean {
    return this.params.status === OrderStatus.PENDING;
  }

  isConfirmed(): boolean {
    return this.params.status === OrderStatus.CONFIRMED;
  }

  isCancelled(): boolean {
    return this.params.status === OrderStatus.CANCELLED;
  }

  private static assertRequiredStrings(params: TOrderCreateInput): void {
    const rules: [keyof Pick<TOrderCreateInput, 'productId' | 'description' | 'productName' | 'idempotencyKey'>, string][] = [
      ['productId', 'productId is required'],
      ['description', 'description is required'],
      ['productName', 'productName is required'],
      ['idempotencyKey', 'idempotencyKey is required'],
    ];

    for (const [key, message] of rules) {
      if (!params[key]) {
        throw new DomainError(message);
      }
    }
  }
}
