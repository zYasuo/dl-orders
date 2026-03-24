import { DomainError, Email, Money, Quantity } from '@app/shared/domain';

export enum INotificationType {
  EMAIL = 'EMAIL',
}

export enum INotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface INotification {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly type: INotificationType;
  status: INotificationStatus;
  readonly sourceEventId: string;
  readonly recipient: string;
  readonly userId: string;
  readonly productName: string;
  readonly productDescription: string;
  readonly totalPrice: number;
  readonly quantity: number;
  sentAt: Date | null;
  readonly createdAt: Date;
  updatedAt: Date;
}

export class NotificationEntity implements INotification {
  constructor(
    readonly id: string,
    readonly title: string,
    readonly content: string,
    readonly type: INotificationType,
    readonly status: INotificationStatus,
    readonly sourceEventId: string,
    readonly recipient: string,
    readonly userId: string,
    readonly productName: string,
    readonly productDescription: string,
    readonly totalPrice: number,
    readonly quantity: number,
    readonly sentAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(params: {
    title: string;
    content: string;
    type: INotificationType;
    sourceEventId: string;
    recipient: string;
    userId: string;
    productName: string;
    productDescription: string;
    totalPrice: number;
    quantity: number;
  }): NotificationEntity {
    if (!params.title) {
      throw new DomainError('title is required');
    }

    if (!params.content) {
      throw new DomainError('content is required');
    }

    if (!params.sourceEventId) {
      throw new DomainError('sourceEventId is required');
    }

    Email.create(params.recipient);
    Money.create(params.totalPrice);
    Quantity.create(params.quantity);

    const now = new Date();
    return new NotificationEntity(
      crypto.randomUUID(),
      params.title,
      params.content,
      params.type,
      INotificationStatus.PENDING,
      params.sourceEventId,
      params.recipient,
      params.userId,
      params.productName,
      params.productDescription,
      params.totalPrice,
      params.quantity,
      null,
      now,
      now,
    );
  }
}
