import { Order } from '../entities/order.entity';

export class OrderWasCreatedEvent {
  constructor(public readonly order: Order) {}
}
