export type TProductCatalogItem = {
  name: string;
  description: string | null;
  price: number;
};

export abstract class ProductCatalogPort {
  abstract findById(productId: string): Promise<TProductCatalogItem | null>;
}
