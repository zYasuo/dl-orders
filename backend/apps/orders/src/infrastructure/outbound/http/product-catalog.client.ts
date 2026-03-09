import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IProductCatalogPort, TProductCatalogItem } from '../../../domain/ports/product-catalog.port';

@Injectable()
export class ProductCatalogHttpClient extends IProductCatalogPort {
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        super();
        this.baseUrl = this.configService.getOrThrow<string>('PRODUCT_SERVICE_URL').replace(/\/$/, '');
    }

    async findById(productId: string): Promise<TProductCatalogItem | null> {
        const url = `${this.baseUrl}/products/${encodeURIComponent(productId)}`;
        const res = await fetch(url);
        if (res.status === 404) return null;
        if (!res.ok) {
            throw new Error(`Product service returned ${res.status}: ${await res.text()}`);
        }
        const body = (await res.json()) as { name: string; description?: string | null; price: number };
        return {
            name: body.name,
            description: body.description ?? null,
            price: Number(body.price),
        };
    }
}
