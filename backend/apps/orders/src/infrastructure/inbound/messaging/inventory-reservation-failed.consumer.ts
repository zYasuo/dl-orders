import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, InventoryReservationFailedEvent } from '@app/shared';
import { CancelOrderUseCase } from '../../../application/use-cases/cancel-order.use-case';

@Controller()
export class InventoryReservationFailedConsumer {
    private readonly logger = new Logger(InventoryReservationFailedConsumer.name);

    constructor(private readonly cancelOrderUseCase: CancelOrderUseCase) {}

    @EventPattern(PATTERNS.INVENTORY_RESERVATION_FAILED)
    async handle(@Payload() payload: InventoryReservationFailedEvent): Promise<void> {
        this.logger.log('Inventory reservation failed, cancelling order', { orderId: payload.orderId });
        await this.cancelOrderUseCase.execute(payload);
    }
}
