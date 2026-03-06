export type TOrderAuditEvent = {
    orderId: string;
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
};

export abstract class IOrderAuditLogPort {
    abstract log(event: TOrderAuditEvent): Promise<void>;
    abstract getByOrderId(orderId: string): Promise<TOrderAuditEvent[]>;
}
