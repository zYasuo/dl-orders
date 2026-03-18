import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, InventoryReservedEvent } from '@app/shared';
import { HandleInventoryReservedUseCase } from '../../../application/use-cases/handle-inventory-reserved.use-case';

@Controller()
export class InventoryReservedConsumer {
  private readonly logger = new Logger(InventoryReservedConsumer.name);

  constructor(private readonly handleInventoryReservedUseCase: HandleInventoryReservedUseCase) {}

  @EventPattern(PATTERNS.INVENTORY_RESERVED)
  async handle(@Payload() payload: InventoryReservedEvent): Promise<void> {
    this.logger.log('Received inventory reserved', { orderId: payload.orderId });
    await this.handleInventoryReservedUseCase.execute(payload);
  }
}
