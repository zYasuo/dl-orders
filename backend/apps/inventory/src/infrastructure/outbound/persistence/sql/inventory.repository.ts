import { Prisma } from '.prisma/inventory-client';
import { Injectable } from '@nestjs/common';
import { InventoryEntity } from '../../../../domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../../../domain/ports/inventory-repository.port';
import { TInventoryLowStockCursor } from '../../../../domain/types/inventory-repository.types';
import { DbService } from '../../../db/db.service';

@Injectable()
export class InventoryRepository extends InventoryRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: InventoryEntity): Promise<InventoryEntity | null> {
    const row = await this.db.inventory.create({
      data: {
        id: entity.id,
        name: entity.name,
        quantity: entity.quantity,
        productId: entity.productId,
        maxQuantity: entity.maxQuantity,
        minQuantity: entity.minQuantity,
        lowStockThreshold: entity.lowStockThreshold,
        createdBy: entity.createdBy,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });

    if (!row) return null;
    return new InventoryEntity(
      row.id,
      row.name,
      row.quantity,
      row.maxQuantity,
      row.minQuantity,
      row.lowStockThreshold,
      row.productId,
      row.createdBy,
      row.createdAt,
      row.updatedAt,
    );
  }

  async findByProductId(productId: string): Promise<InventoryEntity | null> {
    const row = await this.db.inventory.findUnique({ where: { productId } });
    if (!row) return null;
    return new InventoryEntity(
      row.id,
      row.name,
      row.quantity,
      row.maxQuantity,
      row.minQuantity,
      row.lowStockThreshold,
      row.productId,
      row.createdBy,
      row.createdAt,
      row.updatedAt,
    );
  }

  async findByName(name: string): Promise<InventoryEntity | null> {
    const row = await this.db.inventory.findFirst({ where: { name } });
    if (!row) return null;
    return new InventoryEntity(
      row.id,
      row.name,
      row.quantity,
      row.maxQuantity,
      row.minQuantity,
      row.lowStockThreshold,
      row.productId,
      row.createdBy,
      row.createdAt,
      row.updatedAt,
    );
  }

  async decrementStock(id: string, quantity: number): Promise<InventoryEntity | null> {
    type Row = {
      id: string;
      name: string;
      quantity: number;
      maxQuantity: number;
      minQuantity: number;
      lowStockThreshold: number;
      productId: string;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    };

    const rows = await this.db.$queryRaw<Row[]>`
            UPDATE inventories
            SET quantity = quantity - ${quantity}, "updatedAt" = NOW()
            WHERE id = ${id} AND quantity >= ${quantity}
            RETURNING id, name, quantity, maxQuantity, minQuantity, lowStockThreshold, "productId", "createdBy", "createdAt", "updatedAt"
        `;

    if (!rows?.length) return null;

    const row = rows[0];
    return new InventoryEntity(
      row.id,
      row.name,
      row.quantity,
      row.maxQuantity,
      row.minQuantity,
      row.lowStockThreshold,
      row.productId,
      row.createdBy,
      row.createdAt,
      row.updatedAt,
    );
  }

  async findAll(): Promise<InventoryEntity[]> {
    const rows = await this.db.inventory.findMany();
    return rows.map(
      (row) =>
        new InventoryEntity(
          row.id,
          row.name,
          row.quantity,
          row.maxQuantity,
          row.minQuantity,
          row.lowStockThreshold,
          row.productId,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
        ),
    );
  }

  async findLowStock(): Promise<InventoryEntity[]> {
    type Row = {
      id: string;
      name: string;
      quantity: number;
      maxQuantity: number;
      minQuantity: number;
      lowStockThreshold: number;
      productId: string;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    };

    const rows = await this.db.$queryRaw<Row[]>`
      SELECT
        id,
        name,
        quantity,
        max_quantity AS "maxQuantity",
        min_quantity AS "minQuantity",
        low_stock_threshold AS "lowStockThreshold",
        product_id AS "productId",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM inventories
      WHERE quantity <= min_quantity
    `;

    return rows.map(
      (row) =>
        new InventoryEntity(
          row.id,
          row.name,
          row.quantity,
          row.maxQuantity,
          row.minQuantity,
          row.lowStockThreshold,
          row.productId,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
        ),
    );
  }

  async findLowStockPage(
    limit: number,
    cursor: TInventoryLowStockCursor | null,
  ): Promise<InventoryEntity[]> {
    type Row = {
      id: string;
      name: string;
      quantity: number;
      maxQuantity: number;
      minQuantity: number;
      lowStockThreshold: number;
      productId: string;
      createdBy: string;
      createdAt: Date;
      updatedAt: Date;
    };

    const cursorWhere = cursor
      ? Prisma.sql`AND (updated_at > ${cursor.updatedAt} OR (updated_at = ${cursor.updatedAt} AND id > ${cursor.id}))`
      : Prisma.empty;

    const rows = await this.db.$queryRaw<Row[]>`
      SELECT
        id,
        name,
        quantity,
        max_quantity AS "maxQuantity",
        min_quantity AS "minQuantity",
        low_stock_threshold AS "lowStockThreshold",
        product_id AS "productId",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM inventories
      WHERE quantity <= min_quantity
      ${cursorWhere}
      ORDER BY updated_at ASC, id ASC
      LIMIT ${limit}
    `;

    return rows.map(
      (row) =>
        new InventoryEntity(
          row.id,
          row.name,
          row.quantity,
          row.maxQuantity,
          row.minQuantity,
          row.lowStockThreshold,
          row.productId,
          row.createdBy,
          row.createdAt,
          row.updatedAt,
        ),
    );
  }

  async delete(id: string): Promise<InventoryEntity | null> {
    try {
      const row = await this.db.inventory.delete({ where: { id } });
      return new InventoryEntity(
        row.id,
        row.name,
        row.quantity,
        row.maxQuantity,
        row.minQuantity,
        row.lowStockThreshold,
        row.productId,
        row.createdBy,
        row.createdAt,
        row.updatedAt,
      );
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }
}
