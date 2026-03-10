import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { IProductCachePort } from './domain/ports/product-cache.port';
import { IProductRepositoryPort } from './domain/ports/product-repository.port';
import { DbModule } from './infrastructure/db/db.module';
import { ProductController } from './infrastructure/inbound/http/product.controller';
import { RedisProductCacheAdapter } from './infrastructure/outbound/persistence/redis/redis-product-cache.adapter';
import { ProductRepository } from './infrastructure/outbound/persistence/sql/product.repository';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/product/.env',
            isGlobal: true,
        }),
        DbModule,
        RedisModule,
    ],
    controllers: [ProductController],
    providers: [
        CreateProductUseCase,
        FindProductByIdUseCase,
        { provide: IProductCachePort, useClass: RedisProductCacheAdapter },
        { provide: IProductRepositoryPort, useClass: ProductRepository },
    ],
})
export class ProductModule {}
