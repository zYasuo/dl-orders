import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IStockRepositoryPort } from '../../domain/ports/stock-repository.port';
import { TReduceStock } from '../dto/reduce-stock-when-order-created.dto';

@Injectable()
export class ReduceStockWhenOrderCreatedUseCase {
    constructor(private readonly stockRepositoryPort: IStockRepositoryPort) {}

    async execute(input: TReduceStock): Promise<void> {
        const { productId, quantity } = input;

        const stock = await this.stockRepositoryPort.findByProductId(productId);

        if (!stock) {
            throw new NotFoundException('Stock not found');
        }

        const newQuantity = stock.quantity - quantity;

        if (newQuantity < 0) {
            throw new BadRequestException('Stock quantity is not enough');
        }

        await this.stockRepositoryPort.updateQuantity(stock.id, newQuantity);
    }
}
