import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, InventoryReservedEvent } from '@app/shared';
import { ConfirmOrderUseCase } from '../../../application/use-cases/confirm-order.use-case';

@Controller()
export class InventoryReservedConsumer {
    private readonly logger = new Logger(InventoryReservedConsumer.name);

    constructor(private readonly confirmOrderUseCase: ConfirmOrderUseCase) {}

    @EventPattern(PATTERNS.INVENTORY_RESERVED)
    async handle(@Payload() payload: InventoryReservedEvent): Promise<void> {
        this.logger.log('Inventory reserved, confirming order', { orderId: payload.orderId });
        await this.confirmOrderUseCase.execute(payload);
    }
}
