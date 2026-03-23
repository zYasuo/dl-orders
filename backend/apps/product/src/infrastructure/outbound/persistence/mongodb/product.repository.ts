import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DB } from '@app/shared';
import { ProductEntity } from '../../../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../../domain/ports/product-repository.port';

const COLLECTION = 'products';

@Injectable()
export class MongoProductRepository extends ProductRepositoryPort {
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

  async create(entity: ProductEntity): Promise<ProductEntity | null> {
    await this.collection.insertOne({
      _id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      imageUrl: entity.imageUrl ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
    return entity;
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

  async findPage(page: number, limit: number): Promise<ProductEntity[]> {
    const skip = (page - 1) * limit;
    const docs = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    return docs.map((doc) => this.toEntity(doc));
  }

  async count(): Promise<number> {
    return this.collection.countDocuments({});
  }

  async update(entity: ProductEntity): Promise<ProductEntity | null> {
    const result = await this.collection.findOneAndUpdate(
      {
        _id: entity.id,
      },
      {
        $set: {
          name: entity.name,
          description: entity.description,
          price: entity.price,
          imageUrl: entity.imageUrl ?? null,
          updatedAt: entity.updatedAt,
        },
      },
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
