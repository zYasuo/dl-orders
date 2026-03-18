import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IInventoryLowStockEvent, PATTERNS } from '@app/shared';
import { HandleInventoryLowStockUseCase } from '../../../application/use-cases/handle-invetory-low-stock.use-case';

@Controller()
export class InvetoryLowStockConsumer {
  private readonly logger = new Logger(InvetoryLowStockConsumer.name);

  constructor(private readonly handleUseCase: HandleInventoryLowStockUseCase) {}

  @EventPattern(PATTERNS.INVENTORY_LOW_STOCK)
  async handle(@Payload() payload: IInventoryLowStockEvent): Promise<void> {
    const { id, name, productId, quantity } = payload;
    this.logger.log('Received inventory low stock', { id, name, productId, quantity });
    await this.handleUseCase.execute(payload);
  }
}
