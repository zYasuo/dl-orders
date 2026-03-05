import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/orders-client';
import { DbService } from '../../db/db.service';
import { Order, OrderStatus } from '../../../domain/entities/order.entity';
import { IOrdersRepositoryPort } from '../../../domain/ports/orders-repository.port';
import { ICreateOrder } from '../../../domain/types/order-repository.types';

@Injectable()
export class OrdersRepository extends IOrdersRepositoryPort {
    constructor(private readonly db: DbService) { super(); }

    async create(input: ICreateOrder): Promise<Order | null> {
        const order = await this.db.order.create({
            data: {
                productId: input.productId,
                quantity: input.quantity,
                description: input.description,
                recipient: input.recipient,
            },
        });
        if (!order) return null;
        return new Order({
            id: order.id,
            productId: order.productId,
            quantity: order.quantity,
            description: order.description,
            recipient: order.recipient,
            status: order.status as OrderStatus,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        });
    }

    async findById(id: string): Promise<Order | null> {
        const item = await this.db.order.findUnique({ where: { id } });
        return item ? new Order({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            description: item.description,
            recipient: item.recipient,
            status: item.status as OrderStatus,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }) : null;
    }

    async updateStatus(id: string, status: string): Promise<Order | null> {
        try {
            const item = await this.db.order.update({
                where: { id },
                data: { status: status as any },
            });
            return new Order({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                description: item.description,
                recipient: item.recipient,
                status: item.status as OrderStatus,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
            throw e;
        }
    }
}
