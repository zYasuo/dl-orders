import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../../../../common/pipes/zod-validation.pipe';
import { SCreateOrder, type TCreateOrder } from '../../../application/dto/create-order.dto';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../../application/use-cases/list-orders.use-case';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(SCreateOrder))
  create(@Body() dto: TCreateOrder) {
    return this.createOrderUseCase.execute(dto);
  }

  @Get()
  findAll() {
    return this.listOrdersUseCase.execute();
  }
}
