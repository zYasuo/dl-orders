import { ProductEntity } from '../entities/product.entity';
import { ICreateProduct, IUpdateProduct } from '../types/product-repository.types';

export abstract class IProductRepositoryPort {
    abstract create(params: ICreateProduct): Promise<ProductEntity | null>;
    abstract findById(id: string): Promise<ProductEntity | null>;
    abstract findByName(name: string): Promise<ProductEntity | null>;
    abstract findAll(): Promise<ProductEntity[] | null>;
    abstract update(id: string, data: IUpdateProduct): Promise<ProductEntity | null>;
}
