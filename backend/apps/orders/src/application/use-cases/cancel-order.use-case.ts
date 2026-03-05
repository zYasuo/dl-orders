import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '../../domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';
import { InventoryReservationFailedEvent } from '@app/shared';

@Injectable()
export class CancelOrderUseCase {
    private readonly logger = new Logger(CancelOrderUseCase.name);

    constructor(private readonly ordersRepositoryPort: IOrdersRepositoryPort) {}

    async execute(event: InventoryReservationFailedEvent): Promise<void> {
        const order = await this.ordersRepositoryPort.updateStatus(event.orderId, OrderStatus.CANCELLED);

        if (!order) {
            throw new NotFoundException(`Order ${event.orderId} not found`);
        }

        this.logger.log(`Order ${order.id} cancelled: ${event.reason}`);
    }
}
