import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './infrastructure/db/db.module';
import { IProductRepositoryPort } from './domain/ports/product-repository.port';
import { ProductController } from './infrastructure/inbound/http/product.controller';
import { ProductRepository } from './infrastructure/outbound/persistence/sql/product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/product/.env',
            isGlobal: true,
        }),
        DbModule,
    ],
    controllers: [ProductController],
    providers: [
        CreateProductUseCase,
        { provide: IProductRepositoryPort, useClass: ProductRepository },
    ],
})
export class ProductModule {}
