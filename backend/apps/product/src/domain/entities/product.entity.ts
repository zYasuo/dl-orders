import { DomainError, Money } from '@app/shared/domain';

export interface IProduct {
  readonly id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class ProductEntity implements IProduct {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly imageUrl: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: {
    name: string;
    description: string;
    price: number;
    imageUrl?: string | null;
  }): ProductEntity {
    if (!params.name) {
      throw new DomainError('name is required');
    }

    if (!params.description) {
      throw new DomainError('description is required');
    }

    Money.create(params.price);

    const now = new Date();
    return new ProductEntity(
      crypto.randomUUID(),
      params.name,
      params.description,
      params.price,
      params.imageUrl ?? null,
      now,
      now,
    );
  }
}
