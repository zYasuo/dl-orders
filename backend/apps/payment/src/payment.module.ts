import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard, MongoDBModule } from '@app/shared';
import { HandleInventoryReservedUseCase } from './application/use-cases/handle-inventory-reserved.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { FindPaymentByOrderIdUseCase } from './application/use-cases/find-payment-by-order-id.use-case';
import { PaymentAuditLogPort } from './domain/ports/payment-audit-log.port';
import { PaymentEventsPublisherPort } from './domain/ports/payment-events-publisher.port';
import { PaymentGatewayPort } from './domain/ports/payment-gateway.port';
import { PaymentRepositoryPort } from './domain/ports/payment-repository.port';
import { OrderDetailsPort } from './domain/ports/order-details.port';
import { DbModule } from './infrastructure/db/db.module';
import { RabbitMQModule } from './infrastructure/outbound/rabbitmq/rabbitmq.module';
import { PaymentController } from './infrastructure/inbound/http/payment.controller';
import { WebhookSignatureService } from './infrastructure/inbound/http/webhook-signature.service';
import { InventoryReservedConsumer } from './infrastructure/inbound/messaging/inventory-reserved.consumer';
import { MercadoPagoGatewayAdapter } from './infrastructure/outbound/gateway/mercadopago-gateway.adapter';
import { PaymentRabbitMqPublisher } from './infrastructure/outbound/messaging/payment-events.publisher';
import { MongoPaymentAuditLogRepository } from './infrastructure/outbound/persistence/mongodb/payment-audit-log.repository';
import { PaymentRepository } from './infrastructure/outbound/persistence/sql/payment.repository';
import { OrdersHttpClient } from './infrastructure/outbound/http/orders-http.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/payment/.env',
      isGlobal: true,
    }),
    DbModule,
    RabbitMQModule,
    MongoDBModule.forRoot(),
  ],
  controllers: [PaymentController, InventoryReservedConsumer],
  providers: [
    JwtAuthGuard,
    WebhookSignatureService,
    HandleInventoryReservedUseCase,
    HandleWebhookUseCase,
    FindPaymentByOrderIdUseCase,
    { provide: PaymentRepositoryPort, useClass: PaymentRepository },
    { provide: PaymentGatewayPort, useClass: MercadoPagoGatewayAdapter },
    { provide: PaymentEventsPublisherPort, useClass: PaymentRabbitMqPublisher },
    { provide: PaymentAuditLogPort, useClass: MongoPaymentAuditLogRepository },
    { provide: OrderDetailsPort, useClass: OrdersHttpClient },
  ],
})
export class PaymentModule {}
