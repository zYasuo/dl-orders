export type TNotificationAuditEvent = {
    orderId: string;
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
};

export abstract class INotificationAuditLogPort {
    abstract log(event: TNotificationAuditEvent): Promise<void>;
    abstract getByOrderId(orderId: string): Promise<TNotificationAuditEvent[]>;
}
