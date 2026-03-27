import {
  CartAbandonmentScheduleRecord,
  CartAbandonmentScheduleRepositoryPort,
} from '../../src/domain/ports/cart-abandonment-schedule-repository.port';

export class InMemoryCartAbandonmentScheduleRepository extends CartAbandonmentScheduleRepositoryPort {
  private readonly rows = new Map<string, CartAbandonmentScheduleRecord>();

  async upsert(input: CartAbandonmentScheduleRecord): Promise<void> {
    this.rows.set(input.sessionKey, {
      sessionKey: input.sessionKey,
      email: input.email,
      resumeUrl: input.resumeUrl,
      pendingUntil: input.pendingUntil,
      summaryLines: input.summaryLines,
      sent: input.sent,
      failCount: input.failCount,
    });
  }

  async deleteBySessionKey(sessionKey: string): Promise<void> {
    this.rows.delete(sessionKey);
  }

  async findDue(before: Date): Promise<CartAbandonmentScheduleRecord[]> {
    return [...this.rows.values()].filter((r) => !r.sent && r.pendingUntil <= before);
  }

  async markSent(sessionKey: string): Promise<void> {
    const r = this.rows.get(sessionKey);
    if (r) {
      this.rows.set(sessionKey, { ...r, sent: true });
    }
  }

  async incrementFailCount(sessionKey: string): Promise<number> {
    const r = this.rows.get(sessionKey);
    if (!r) {
      return 0;
    }
    const failCount = r.failCount + 1;
    this.rows.set(sessionKey, { ...r, failCount });
    return failCount;
  }

  getRow(sessionKey: string): CartAbandonmentScheduleRecord | undefined {
    return this.rows.get(sessionKey);
  }

  clear(): void {
    this.rows.clear();
  }
}
