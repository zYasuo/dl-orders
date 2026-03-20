import { Prisma } from '.prisma/payment-client';
import { Injectable } from '@nestjs/common';
import { PaymentEntity, PaymentStatus } from '../../../../domain/entities/payment.entity';
import { PaymentRepositoryPort } from '../../../../domain/ports/payment-repository.port';
import { DbService } from '../../../db/db.service';

@Injectable()
export class PaymentRepository extends PaymentRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(entity: PaymentEntity): Promise<PaymentEntity | null> {
    try {
      const row = await this.db.payment.create({
        data: {
          id: entity.id,
          orderId: entity.orderId,
          amount: entity.amount,
          idempotencyKey: entity.idempotencyKey ?? null,
          preferenceId: entity.preferenceId ?? null,
          externalId: entity.externalId ?? null,
          status: entity.status,
          gatewayResponse: entity.gatewayResponse ?? null,
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        },
      });

      return this.toDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        if (entity.idempotencyKey) {
          const existing = await this.findByIdempotencyKey(entity.idempotencyKey);
          if (existing) return existing;
        }
        const existing = await this.findByOrderId(entity.orderId);
        return existing;
      }
      throw err;
    }
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity | null> {
    const row = await this.db.payment.findUnique({ where: { orderId } });

    if (!row) return null;

    return this.toDomain(row);
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentEntity | null> {
    const row = await this.db.payment.findUnique({ where: { idempotencyKey } });

    if (!row) return null;

    return this.toDomain(row);
  }

  async findByExternalId(externalId: string): Promise<PaymentEntity | null> {
    const row = await this.db.payment.findUnique({ where: { externalId } });

    if (!row) return null;

    return this.toDomain(row);
  }

  async updateStatus(entity: PaymentEntity): Promise<PaymentEntity | null> {
    const row = await this.db.payment.update({
      where: { id: entity.id },
      data: this.toPersistenceUpdate(entity) as never,
    });

    if (!row) return null;
    return this.toDomain(row);
  }

  async updateStatusIfPending(entity: PaymentEntity): Promise<PaymentEntity | null> {
    const result = await this.db.payment.updateMany({
      where: { id: entity.id, status: PaymentStatus.PENDING },
      data: this.toPersistenceUpdate(entity) as never,
    });

    if (result.count === 0) return null;

    const row = await this.db.payment.findUnique({ where: { id: entity.id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  private toPersistenceUpdate(entity: PaymentEntity): Record<string, unknown> {
    return {
      status: entity.status,
      externalId: entity.externalId,
      preferenceId: entity.preferenceId,
      gatewayResponse: entity.gatewayResponse,
      updatedAt: entity.updatedAt,
    };
  }

  private toDomain(row: {
    id: string;
    orderId: string;
    idempotencyKey: string | null;
    externalId: string | null;
    preferenceId: string | null;
    amount: number;
    status: string;
    gatewayResponse: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): PaymentEntity {
    return new PaymentEntity({
      id: row.id,
      orderId: row.orderId,
      idempotencyKey: row.idempotencyKey,
      externalId: row.externalId,
      preferenceId: row.preferenceId,
      amount: row.amount,
      status: row.status as PaymentStatus,
      gatewayResponse: row.gatewayResponse as Record<string, unknown> | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
