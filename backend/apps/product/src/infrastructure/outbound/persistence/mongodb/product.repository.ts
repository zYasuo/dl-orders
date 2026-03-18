import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import { ProductEntity } from '../../../../domain/entities/product.entity';
import { IProductRepositoryPort } from '../../../../domain/ports/product-repository.port';
import { ICreateProduct, IUpdateProduct } from '../../../../domain/types/product-repository.types';

const COLLECTION = 'products';

@Injectable()
export class MongoProductRepository extends IProductRepositoryPort {
  private readonly collection = this.db.collection<{
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>(COLLECTION);

  constructor(@Inject(MONGODB_DB) private readonly db: Db) {
    super();
  }

  async create(params: ICreateProduct): Promise<ProductEntity | null> {
    const { name, description, price, imageUrl } = params;
    const now = new Date();
    const id = crypto.randomUUID();
    const image = imageUrl ?? null;
    await this.collection.insertOne({
      _id: id,
      name,
      description,
      price,
      imageUrl: image,
      createdAt: now,
      updatedAt: now,
    });
    return new ProductEntity(id, name, description, price, image, now, now);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByName(name: string): Promise<ProductEntity | null> {
    const doc = await this.collection.findOne({ name });
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findAll(): Promise<ProductEntity[] | null> {
    const docs = await this.collection.find({}).toArray();
    if (!docs.length) return null;
    return docs.map((doc) => this.toEntity(doc));
  }

  async update(id: string, data: IUpdateProduct): Promise<ProductEntity | null> {
    const { name, description, price, imageUrl } = data;
    const now = new Date();
    const update: Record<string, unknown> = { name, description, price, updatedAt: now };
    if (imageUrl !== undefined) update.imageUrl = imageUrl ?? null;
    const result = await this.collection.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { returnDocument: 'after' },
    );
    if (!result) return null;
    return this.toEntity(result);
  }

  private toEntity(doc: {
    _id: string;
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ProductEntity {
    const { _id, name, description, price, createdAt, updatedAt } = doc;
    const imageUrl = doc.imageUrl ?? null;
    return new ProductEntity(_id, name, description, price, imageUrl, createdAt, updatedAt);
  }
}
