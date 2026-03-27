import { Injectable } from '@nestjs/common';
import { Prisma } from '.prisma/orders-client';
import { DbService } from '../../../db/db.service';
import { OrderEntity, OrderStatus } from '../../../../domain/entities/order.entity';
import { OrdersRepositoryPort } from '../../../../domain/ports/orders-repository.port';

@Injectable()
export class OrdersRepository extends OrdersRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: OrderEntity): Promise<OrderEntity> {
    try {
      const order = await this.db.order.create({
        data: {
          id: entity.id,
          productId: entity.productId,
          quantity: entity.quantity,
          description: entity.description,
          recipient: entity.recipient,
          productName: entity.productName,
          productDescription: entity.productDescription,
          unitPrice: entity.unitPrice,
          totalPrice: entity.totalPrice,
          idempotencyKey: entity.idempotencyKey,
        },
      });

      return new OrderEntity({
        id: order.id,
        sequenceId: order.sequenceId,
        productId: order.productId,
        quantity: order.quantity,
        description: order.description,
        recipient: order.recipient,
        productName: order.productName,
        productDescription: order.productDescription,
        unitPrice: order.unitPrice,
        totalPrice: order.totalPrice,
        status: order.status as OrderStatus,
        idempotencyKey: order.idempotencyKey,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const existing = await this.findByIdempotencyKey(entity.idempotencyKey);
        if (existing) return existing;
      }
      throw e;
    }
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const item = await this.db.order.findUnique({ where: { id } });
    return item
      ? new OrderEntity({
          id: item.id,
          sequenceId: item.sequenceId,
          productId: item.productId,
          quantity: item.quantity,
          description: item.description,
          recipient: item.recipient,
          productName: item.productName,
          productDescription: item.productDescription,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.status as OrderStatus,
          idempotencyKey: item.idempotencyKey,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })
      : null;
  }

  async findPageByRecipient(
    recipientEmail: string,
    page: number,
    limit: number,
  ): Promise<OrderEntity[]> {
    const skip = (page - 1) * limit;
    const rows = await this.db.order.findMany({
      where: { recipient: { equals: recipientEmail, mode: 'insensitive' } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(
      (item) =>
        new OrderEntity({
          id: item.id,
          sequenceId: item.sequenceId,
          productId: item.productId,
          quantity: item.quantity,
          description: item.description,
          recipient: item.recipient,
          productName: item.productName,
          productDescription: item.productDescription,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.status as OrderStatus,
          idempotencyKey: item.idempotencyKey,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
    );
  }

  async countByRecipient(recipientEmail: string): Promise<number> {
    return this.db.order.count({
      where: { recipient: { equals: recipientEmail, mode: 'insensitive' } },
    });
  }

  async findPage(page: number, limit: number): Promise<OrderEntity[]> {
    const skip = (page - 1) * limit;
    const rows = await this.db.order.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(
      (item) =>
        new OrderEntity({
          id: item.id,
          sequenceId: item.sequenceId,
          productId: item.productId,
          quantity: item.quantity,
          description: item.description,
          recipient: item.recipient,
          productName: item.productName,
          productDescription: item.productDescription,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          status: item.status as OrderStatus,
          idempotencyKey: item.idempotencyKey,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
    );
  }

  async count(): Promise<number> {
    return this.db.order.count();
  }

  async updateStatus(id: string, status: string): Promise<OrderEntity | null> {
    try {
      const item = await this.db.order.update({
        where: { id },
        data: { status: status as OrderStatus },
      });

      return new OrderEntity({
        id: item.id,
        sequenceId: item.sequenceId,
        productId: item.productId,
        quantity: item.quantity,
        description: item.description,
        recipient: item.recipient,
        productName: item.productName,
        productDescription: item.productDescription,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        status: item.status as OrderStatus,
        idempotencyKey: item.idempotencyKey,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
      throw e;
    }
  }

  async confirmIfPending(orderId: string): Promise<OrderEntity | null> {
    const result = await this.db.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.PENDING,
      },
      data: {
        status: OrderStatus.CONFIRMED,
      },
    });

    if (result.count === 0) {
      return null;
    }

    const item = await this.db.order.findUnique({
      where: { id: orderId },
    });

    if (!item) return null;

    return new OrderEntity({
      id: item.id,
      sequenceId: item.sequenceId,
      productId: item.productId,
      quantity: item.quantity,
      description: item.description,
      recipient: item.recipient,
      productName: item.productName,
      productDescription: item.productDescription,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      status: item.status as OrderStatus,
      idempotencyKey: item.idempotencyKey,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  async cancelIfPending(orderId: string): Promise<OrderEntity | null> {
    const result = await this.db.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.PENDING,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    if (result.count === 0) {
      return null;
    }

    const item = await this.db.order.findUnique({
      where: { id: orderId },
    });

    if (!item) return null;

    return new OrderEntity({
      id: item.id,
      sequenceId: item.sequenceId,
      productId: item.productId,
      quantity: item.quantity,
      description: item.description,
      recipient: item.recipient,
      productName: item.productName,
      productDescription: item.productDescription,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      status: item.status as OrderStatus,
      idempotencyKey: item.idempotencyKey,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<OrderEntity | null> {
    const item = await this.db.order.findUnique({ where: { idempotencyKey } });
    if (!item) return null;

    return new OrderEntity({
      id: item.id,
      sequenceId: item.sequenceId,
      productId: item.productId,
      quantity: item.quantity,
      description: item.description,
      recipient: item.recipient,
      productName: item.productName,
      productDescription: item.productDescription,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      status: item.status as OrderStatus,
      idempotencyKey: item.idempotencyKey,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }
}
