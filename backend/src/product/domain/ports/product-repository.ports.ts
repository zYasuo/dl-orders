import { Product } from '../entities/product.entity';
import { ICreateProduct, IUpdateProduct } from '../types/product-repository.types';

export abstract class IProductRepositoryPort {
    abstract create(params: ICreateProduct): Promise<Product | null>;
    abstract findById(id: string): Promise<Product | null>;
    abstract findByName(name: string): Promise<Product | null>;
    abstract update(id: string, data: IUpdateProduct): Promise<Product | null>;
}
