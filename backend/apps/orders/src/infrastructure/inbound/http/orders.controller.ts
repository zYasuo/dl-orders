import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '@app/shared';
import { CreateOrderDto, SCreateOrder, type TCreateOrder } from '../../../application/dto/create-order.dto';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from '../../../application/use-cases/find-order-by-id.use-case';
import { IOrderAuditLogPort } from '../../../domain/ports/order-audit-log.port';
import { IOrderSummaryPort } from '../../../domain/ports/order-summary.port';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
        private readonly orderAuditLogPort: IOrderAuditLogPort,
        private readonly orderSummaryPort: IOrderSummaryPort,
    ) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Create order' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: 202, description: 'Order accepted for processing' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    createOrder(@Body(new ZodValidationPipe(SCreateOrder)) dto: TCreateOrder) {
        return this.createOrderUseCase.execute(dto);
    }

    @Get(':id/audit-log')
    @ApiOperation({ summary: 'Order audit log' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'List of audit events' })
    getOrderAuditLog(@Param('id') id: string) {
        return this.orderAuditLogPort.getByOrderId(id);
    }

    @Get(':id/summary')
    @ApiOperation({ summary: 'Order summary' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order summary' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async getOrderSummary(@Param('id') id: string) {
        const summary = await this.orderSummaryPort.getByOrderId(id);
        if (!summary) {
            throw new NotFoundException(`Order ${id} summary not found`);
        }
        return summary;
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order by ID' })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order found' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    findOrderById(@Param('id') id: string) {
        return this.findOrderByIdUseCase.execute(id);
    }
}
