export type CartAbandonmentScheduleRecord = {
  sessionKey: string;
  email: string;
  resumeUrl: string;
  pendingUntil: Date;
  summaryLines: string;
  sent: boolean;
  failCount: number;
};

export abstract class CartAbandonmentScheduleRepositoryPort {
  abstract upsert(input: CartAbandonmentScheduleRecord): Promise<void>;
  abstract deleteBySessionKey(sessionKey: string): Promise<void>;
  abstract findDue(before: Date): Promise<CartAbandonmentScheduleRecord[]>;
  abstract markSent(sessionKey: string): Promise<void>;
  abstract incrementFailCount(sessionKey: string): Promise<number>;
}
