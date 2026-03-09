import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.port';

@Injectable()
export class FindProductByIdUseCase {
    constructor(private readonly productRepositoryPort: IProductRepositoryPort) {}

    async execute(id: string): Promise<Product> {
        const product = await this.productRepositoryPort.findById(id);
        if (!product) {
            throw new NotFoundException(`Product ${id} not found`);
        }
        return product;
    }
}
