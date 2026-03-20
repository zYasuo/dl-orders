import { Body, Controller, NotFoundException, Param } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SCreateOrder, type TCreateOrder } from '../../../application/dto/create-order.dto';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from '../../../application/use-cases/find-order-by-id.use-case';
import { OrderAuditLogPort } from '../../../domain/ports/order-audit-log.port';
import { OrderSummaryPort } from '../../../domain/ports/order-summary.port';
import { OrdersDoc, ApiOrders } from './docs/orders-doc.decorator';

@ApiOrders()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly orderAuditLogPort: OrderAuditLogPort,
    private readonly orderSummaryPort: OrderSummaryPort,
  ) {}

  @OrdersDoc.Create()
  createOrder(@Body(new ZodValidationPipe(SCreateOrder)) dto: TCreateOrder) {
    return this.createOrderUseCase.execute(dto);
  }

  @OrdersDoc.AuditLog()
  getOrderAuditLog(@Param('id') id: string) {
    return this.orderAuditLogPort.getByOrderId(id);
  }

  @OrdersDoc.Summary()
  async getOrderSummary(@Param('id') id: string) {
    const summary = await this.orderSummaryPort.getByOrderId(id);
    if (!summary) {
      throw new NotFoundException(`Order ${id} summary not found`);
    }
    return summary;
  }

  @OrdersDoc.GetById()
  findOrderById(@Param('id') id: string) {
    return this.findOrderByIdUseCase.execute(id);
  }
}
