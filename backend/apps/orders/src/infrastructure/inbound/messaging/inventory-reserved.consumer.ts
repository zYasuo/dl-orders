import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, InventoryReservedEvent } from '@app/shared';
import { OrderEventsPublisherPort } from '../../../domain/ports/order-events-publisher.port';

@Controller()
export class InventoryReservedConsumer {
  private readonly logger = new Logger(InventoryReservedConsumer.name);

  constructor(private readonly orderEventsPublisherPort: OrderEventsPublisherPort) {}

  @EventPattern(PATTERNS.INVENTORY_RESERVED)
  async handle(@Payload() payload: InventoryReservedEvent): Promise<void> {
    this.logger.log('Inventory reserved, forwarding to payment', { orderId: payload.orderId });
    await this.orderEventsPublisherPort.publishInventoryReservedToPayment(payload);
  }
}
