import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StockRepositoryPort } from '../../../domain/stock/ports/stock-repository.port';
import { TReduceStock } from '../dto/reduce-stock-when-order-created.dto';

@Injectable()
export class ReduceStockWhenOrderCreatedUseCase {
    constructor(private readonly stockRepositoryPort: StockRepositoryPort) {}

    async execute(input: TReduceStock): Promise<void> {
        
        const stock = await this.stockRepositoryPort.findById(input.id);
        if (!stock) {
            throw new NotFoundException('Stock not found');
        }

        const newQuantity = stock.quantity - input.quantity;
        if (newQuantity < 0) {
            throw new BadRequestException('Stock quantity is not enough');
        }

        await this.stockRepositoryPort.updateQuantity(stock.id, newQuantity);
    }
}
