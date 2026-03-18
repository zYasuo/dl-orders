export type TProductCatalogItem = {
  name: string;
  description: string | null;
  price: number;
};

export abstract class IProductCatalogPort {
  abstract findById(productId: string): Promise<TProductCatalogItem | null>;
}
