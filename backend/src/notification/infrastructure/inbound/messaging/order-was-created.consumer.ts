import { Controller, Logger, UsePipes } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SOrderWasCreatedPayload, type TOrderWasCreatedPayload } from '../../../application/dto/order-was-created-payload.schema';
import { CreateNotificationWhenOrderCreatedUseCase } from '../../../application/use-cases/create-notification-when-order-created.use-case';

@Controller()
export class OrderWasCreatedNotificationConsumer {
    private readonly logger = new Logger(OrderWasCreatedNotificationConsumer.name);

    constructor(private readonly createNotificationWhenOrderCreatedUseCase: CreateNotificationWhenOrderCreatedUseCase) {}

    @EventPattern('order.was_created')
    @UsePipes(new ZodValidationPipe(SOrderWasCreatedPayload))
    async handle(@Payload() payload: TOrderWasCreatedPayload): Promise<void> {
        this.logger.log('Creating notification for order created', { orderId: payload.id });

        await this.createNotificationWhenOrderCreatedUseCase.execute(payload);
    }
}
