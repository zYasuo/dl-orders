import { Injectable } from '@nestjs/common';
import { IOrdersRepositoryPort } from '../../domain/ports/orders-repository.port';

@Injectable()
export class ListOrdersUseCase {
  constructor(private readonly ordersRepositoryPort: IOrdersRepositoryPort) {}

  execute() {
    return this.ordersRepositoryPort.findAll();
  }
}
