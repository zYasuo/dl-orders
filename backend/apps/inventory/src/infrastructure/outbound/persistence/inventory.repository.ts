import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/inventory-client';
import { DbService } from '../../db/db.service';
import { Inventory } from '../../../domain/entities/inventory.entity';
import { IInventoryRepositoryPort } from '../../../domain/ports/inventory-repository.port';
import { ICreateInventory } from '../../../domain/types/inventory-repository.types';

@Injectable()
export class InventoryRepository extends IInventoryRepositoryPort {
    constructor(private readonly db: DbService) { super(); }

    async create(input: ICreateInventory): Promise<Inventory | null> {
        const { name, quantity, productId } = input;
        const now = new Date();
        const row = await this.db.inventory.create({
            data: { name, quantity, productId, createdAt: now, updatedAt: now },
        });
        if (!row) return null;
        return new Inventory(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async findByProductId(productId: string): Promise<Inventory | null> {
        const row = await this.db.inventory.findUnique({ where: { productId } });
        if (!row) return null;
        return new Inventory(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async findByName(name: string): Promise<Inventory | null> {
        const row = await this.db.inventory.findFirst({ where: { name } });
        if (!row) return null;
        return new Inventory(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
    }

    async updateProductAvailable(id: string, quantity: number): Promise<Inventory | null> {
        try {
            const row = await this.db.inventory.update({ where: { id }, data: { quantity } });
            return new Inventory(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
            throw e;
        }
    }

    async delete(id: string): Promise<Inventory | null> {
        try {
            const row = await this.db.inventory.delete({ where: { id } });
            return new Inventory(row.id, row.name, row.quantity, row.productId, row.createdAt, row.updatedAt);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
            throw e;
        }
    }
}
