import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ProductCatalogPort,
  TProductCatalogItem,
} from '../../../domain/ports/product-catalog.port';
import { SProductCatalogResponse } from './product-catalog-response.schema';

@Injectable()
export class ProductCatalogHttpClient extends ProductCatalogPort {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    super();
    this.baseUrl = this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL').replace(/\/$/, '');
  }

  async findById(productId: string): Promise<TProductCatalogItem | null> {
    const url = `${this.baseUrl}/api/v1/products/${encodeURIComponent(productId)}`;
    const res = await fetch(url);

    if (res.status === 404) return null;

    if (!res.ok) {
      throw new Error(`Product service returned ${res.status}: ${await res.text()}`);
    }

    const raw = (await res.json()) as unknown;

    const parsed = SProductCatalogResponse.safeParse(raw);
    if (!parsed.success) {
      throw new Error(
        `Product service contract mismatch: ${parsed.error.message}. ` +
          'Expected name (string), description (string|null), price (number).',
      );
    }

    const body = parsed.data;

    return {
      name: body.name,
      description: body.description ?? null,
      price: body.price,
    };
  }
}
