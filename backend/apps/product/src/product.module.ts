import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoDBModule } from '@app/shared';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from './application/use-cases/find-all-products.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { IProductCachePort } from './domain/ports/product-cache.port';
import { IProductRepositoryPort } from './domain/ports/product-repository.port';
import { ProductController } from './infrastructure/inbound/http/product.controller';
import { MongoProductRepository } from './infrastructure/outbound/persistence/mongodb/product.repository';
import { RedisProductCacheAdapter } from './infrastructure/outbound/persistence/redis/redis-product-cache.adapter';
import { RedisModule } from './infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/product/.env',
      isGlobal: true,
    }),
    MongoDBModule.forRoot(),
    RedisModule,
  ],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    { provide: IProductCachePort, useClass: RedisProductCacheAdapter },
    { provide: IProductRepositoryPort, useClass: MongoProductRepository },
  ],
})
export class ProductModule {}
