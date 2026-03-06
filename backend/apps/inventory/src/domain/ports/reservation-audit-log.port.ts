export type TReservationAuditEvent = {
    orderId: string;
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
};

export abstract class IReservationAuditLogPort {
    abstract log(event: TReservationAuditEvent): Promise<void>;
    abstract getByOrderId(orderId: string): Promise<TReservationAuditEvent[]>;
}
