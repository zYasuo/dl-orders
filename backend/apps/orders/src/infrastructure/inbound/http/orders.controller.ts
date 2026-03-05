import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SCreateOrder, type TCreateOrder } from '../../../application/dto/create-order.dto';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { FindOrderByIdUseCase } from '../../../application/use-cases/find-order-by-id.use-case';

@Controller('orders')
export class OrdersController {
    constructor(
        private readonly createOrderUseCase: CreateOrderUseCase,
        private readonly findOrderByIdUseCase: FindOrderByIdUseCase,
    ) {}

    @Post()
    @HttpCode(HttpStatus.ACCEPTED)
    @UsePipes(new ZodValidationPipe(SCreateOrder))
    createOrder(@Body() dto: TCreateOrder) {
        return this.createOrderUseCase.execute(dto);
    }

    @Get(':id')
    findOrderById(@Param('id') id: string) {
        return this.findOrderByIdUseCase.execute(id);
    }
}
