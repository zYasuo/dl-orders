import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule, JwtAuthGuard, MongoDBModule } from '@app/shared';
import { ProductCacheKeyBuilder } from './application/cache/product-cache-key-builder';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { FindAllProductsUseCase } from './application/use-cases/find-all-products.use-case';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.use-case';
import { ProductCachePort } from './domain/ports/product-cache.port';
import { ProductRepositoryPort } from './domain/ports/product-repository.port';
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
    CacheModule,
  ],
  controllers: [ProductController],
  providers: [
    JwtAuthGuard,
    CreateProductUseCase,
    FindAllProductsUseCase,
    FindProductByIdUseCase,
    ProductCacheKeyBuilder,
    { provide: ProductCachePort, useClass: RedisProductCacheAdapter },
    { provide: ProductRepositoryPort, useClass: MongoProductRepository },
  ],
})
export class ProductModule {}
