import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Stock } from 'src/stock/domain/entities/stock.entity';
import { IProductRepositoryPort } from '../../../product/domain/ports/product-repository.ports';
import { IStockRepositoryPort } from '../../domain/ports/stock-repository.port';
import { TCreateStockWithProductRelation } from '../dto/create-stock-with-product-relation.schema';

@Injectable()
export class CreateStockWithProductRelationUseCase {
    constructor(
        private readonly stockRepositoryPort: IStockRepositoryPort,
        private readonly productRepositoryPort: IProductRepositoryPort,
    ) {}

    async execute(input: TCreateStockWithProductRelation): Promise<Stock> {
        const { productId, name, quantity } = input;

        const product = await this.productRepositoryPort.findById(productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const existingStock = await this.stockRepositoryPort.findByProductId(productId);

        if (existingStock) {
            throw new BadRequestException('Stock already exists for this product');
        }

        const existingStockByName = await this.stockRepositoryPort.findByName(name);

        if (existingStockByName) {
            throw new BadRequestException('A stock with this name already exists');
        }

        const createdStock = await this.stockRepositoryPort.create({ name, quantity, productId });

        if (!createdStock) {
            throw new InternalServerErrorException('Failed to create stock');
        }

        return createdStock;
    }
}
