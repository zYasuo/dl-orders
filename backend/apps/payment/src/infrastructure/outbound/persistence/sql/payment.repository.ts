import { Prisma } from '.prisma/payment-client';
import { Injectable } from '@nestjs/common';
import { PaymentEntity, PaymentStatus } from '../../../../domain/entities/payment.entity';
import { IPaymentRepositoryPort } from '../../../../domain/ports/payment-repository.port';
import {
  ICreatePayment,
  IUpdatePaymentStatus,
} from '../../../../domain/types/payment-repository.types';
import { DbService } from '../../../db/db.service';

@Injectable()
export class PaymentRepository extends IPaymentRepositoryPort {
  constructor(private readonly db: DbService) {
    super();
  }

  async create(input: ICreatePayment): Promise<PaymentEntity | null> {
    try {
      const row = await this.db.payment.create({
        data: {
          orderId: input.orderId,
          amount: input.amount,
          idempotencyKey: input.idempotencyKey ?? null,
          preferenceId: input.preferenceId ?? null,
          externalId: input.externalId ?? null,
        },
      });

      return this.toDomain(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        if (input.idempotencyKey) {
          const existing = await this.findByIdempotencyKey(input.idempotencyKey);
          if (existing) return existing;
        }
        const existing = await this.findByOrderId(input.orderId);
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

  async updateStatus(id: string, data: IUpdatePaymentStatus): Promise<PaymentEntity | null> {
    const updateData = this.buildUpdateData(data);

    const row = await this.db.payment.update({
      where: { id },
      data: updateData as never,
    });

    if (!row) return null;
    return this.toDomain(row);
  }

  async updateStatusIfPending(
    id: string,
    data: IUpdatePaymentStatus,
  ): Promise<PaymentEntity | null> {
    const updateData = this.buildUpdateData(data);

    const result = await this.db.payment.updateMany({
      where: { id, status: PaymentStatus.PENDING },
      data: updateData as never,
    });

    if (result.count === 0) return null;

    const row = await this.db.payment.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  private buildUpdateData(data: IUpdatePaymentStatus): Record<string, unknown> {
    const updateData: Record<string, unknown> = { status: data.status };
    if (data.externalId !== undefined) updateData.externalId = data.externalId;
    if (data.preferenceId !== undefined) updateData.preferenceId = data.preferenceId;
    if (data.gatewayResponse !== undefined) updateData.gatewayResponse = data.gatewayResponse;
    return updateData;
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
