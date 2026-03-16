export type TNotificationAuditEvent = {
    data: string;
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
};

export abstract class INotificationAuditLogPort {
    abstract log(event: TNotificationAuditEvent): Promise<void>;
    abstract getByData(data: string): Promise<TNotificationAuditEvent[]>;
}
