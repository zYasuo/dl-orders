import { Body, Controller, NotFoundException, Param, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Paginated, ZodValidationPipe } from '@app/shared';
import { SCreateOrder, type TCreateOrder } from '../../../application/dto/create-order.dto';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import {
  SFindAllOrdersQuery,
  type TFindAllOrdersQuery,
} from '../../../application/dto/find-all-orders-query.schema';
import { FindAllOrdersUseCase } from '../../../application/use-cases/find-all-orders.use-case';
import { FindOrderByIdUseCase } from '../../../application/use-cases/find-order-by-id.use-case';
import { OrderEntity } from '../../../domain/entities/order.entity';
import { OrderAuditLogPort } from '../../../domain/ports/order-audit-log.port';
import { OrderSummaryPort } from '../../../domain/ports/order-summary.port';
import { OrdersDoc, ApiOrders } from './docs/orders-doc.decorator';
import { orderAccessFromRequest } from '../../../application/types/order-access.context';

@ApiOrders()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly findAllOrdersUseCase: FindAllOrdersUseCase,
    private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    private readonly orderAuditLogPort: OrderAuditLogPort,
    private readonly orderSummaryPort: OrderSummaryPort,
  ) {}

  @OrdersDoc.Create()
  createOrder(@Body(new ZodValidationPipe(SCreateOrder)) dto: TCreateOrder, @Req() req: Request) {
    return this.createOrderUseCase.execute(dto, orderAccessFromRequest(req));
  }

  @OrdersDoc.List()
  findAllOrders(
    @Query(new ZodValidationPipe(SFindAllOrdersQuery)) query: TFindAllOrdersQuery,
    @Req() req: Request,
  ): Promise<Paginated<OrderEntity>> {
    return this.findAllOrdersUseCase.execute(query, orderAccessFromRequest(req));
  }

  @OrdersDoc.AuditLog()
  async getOrderAuditLog(@Param('id') id: string, @Req() req: Request) {
    await this.findOrderByIdUseCase.execute(id, orderAccessFromRequest(req));
    return this.orderAuditLogPort.getByOrderId(id);
  }

  @OrdersDoc.Summary()
  async getOrderSummary(@Param('id') id: string, @Req() req: Request) {
    await this.findOrderByIdUseCase.execute(id, orderAccessFromRequest(req));
    const summary = await this.orderSummaryPort.getByOrderId(id);
    if (!summary) {
      throw new NotFoundException(`Order ${id} summary not found`);
    }
    return summary;
  }

  @OrdersDoc.GetById()
  findOrderById(@Param('id') id: string, @Req() req: Request) {
    return this.findOrderByIdUseCase.execute(id, orderAccessFromRequest(req));
  }
}
