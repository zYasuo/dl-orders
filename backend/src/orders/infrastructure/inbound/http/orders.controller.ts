import { Body, Controller, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
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
  @UsePipes(new ZodValidationPipe(SCreateOrder))
  create(@Body() dto: TCreateOrder) {
    return this.createOrderUseCase.execute(dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.findOrderByIdUseCase.execute(id);
  }
}
