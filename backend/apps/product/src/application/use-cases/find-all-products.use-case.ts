import { Injectable } from '@nestjs/common';
import { Paginated } from '@app/shared';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ProductEntity } from '../../domain/entities/product.entity';

@Injectable()
export class FindAllProductsUseCase {
  constructor(private readonly productRepositoryPort: ProductRepositoryPort) {}

  async execute(page: number, limit: number): Promise<Paginated<ProductEntity>> {
    const [data, total] = await Promise.all([
      this.productRepositoryPort.findPage(page, limit),
      this.productRepositoryPort.count(),
    ]);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

    return {
      data,
      meta: { page, limit, total, totalPages },
    };
  }
}
