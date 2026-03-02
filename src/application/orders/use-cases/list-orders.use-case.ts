import { Injectable } from '@nestjs/common';
import { OrdersRepositoryPort } from '../../../domain/orders/ports/orders-repository.port';

@Injectable()
export class ListOrdersUseCase {
    constructor(private readonly ordersRepositoryPort: OrdersRepositoryPort) {}

    execute() {
        return this.ordersRepositoryPort.findAll();
    }
}
