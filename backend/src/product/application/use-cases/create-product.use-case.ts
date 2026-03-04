import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product } from 'src/product/domain/entrities/product.entity';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.ports';
import { TCreateProduct } from '../dto/create-product.schema';

@Injectable()
export class CreateProductUseCase {
    constructor(private readonly productRepositoryPort: IProductRepositoryPort) {}

    async execute(input: TCreateProduct): Promise<Product> {
        const { name, description, price } = input;

        const product = Product.create({ name, description, price });

        await this.productRepositoryPort.create(product);

        if (!product) {
            throw new InternalServerErrorException('Failed to create product');
        }

        return product;
    }
}
