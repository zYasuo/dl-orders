import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import { IProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ICreateProduct } from '../../domain/types/product-repository.types';
import { TCreateProduct } from '../dto/create-product.schema';

@Injectable()
export class CreateProductUseCase {
    constructor(private readonly productRepositoryPort: IProductRepositoryPort) {}

    async execute(input: TCreateProduct): Promise<Product> {
        const { name, description, price } = input;

        const existingProduct = await this.productRepositoryPort.findByName(name);

        if (existingProduct) {
            throw new BadRequestException('Product already exists');
        }

        const createInput: ICreateProduct = { name, description, price };

        const createdProduct = await this.productRepositoryPort.create(createInput);

        if (!createdProduct) {
            throw new InternalServerErrorException('Failed to create product');
        }

        return createdProduct;
    }
}
