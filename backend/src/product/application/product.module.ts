import { Module } from '@nestjs/common';
import { IProductRepositoryPort } from '../domain/ports/product-repository.ports';
import { ProductController } from '../infrastructure/inbound/http/product.controller';
import { ProductRepository } from '../infrastructure/outbound/product.repository';
import { CreateProductUseCase } from './use-cases/create-product.use-case';

@Module({
    imports: [],
    controllers: [ProductController],
    providers: [
        CreateProductUseCase,
        {
            provide: IProductRepositoryPort,
            useClass: ProductRepository,
        },
    ],
    exports: [IProductRepositoryPort],
})
export class ProductModule {}
