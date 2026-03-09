export type TPaymentAuditEvent = {
    orderId: string;
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
};

export abstract class IPaymentAuditLogPort {
    abstract log(event: TPaymentAuditEvent): Promise<void>;
    abstract getByOrderId(orderId: string): Promise<TPaymentAuditEvent[]>;
}
