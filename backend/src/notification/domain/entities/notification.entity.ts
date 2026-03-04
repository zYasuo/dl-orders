export enum INotificationType {
    EMAIL = 'EMAIL',
}

export enum INotificationStatus {
    PENDING = 'PENDING',
    SENT = 'SENT',
    FAILED = 'FAILED',
}

export interface INotification {
    readonly id: string;
    readonly title: string;
    readonly content: string;
    readonly type: INotificationType;
    status: INotificationStatus;
    readonly sourceEventId: string;
    readonly recipient: string;
    sentAt: Date | null;
    readonly createdAt: Date;
    updatedAt: Date;
}

export class Notification implements INotification {
    constructor(
        readonly id: string,
        readonly title: string,
        readonly content: string,
        readonly type: INotificationType,
        readonly status: INotificationStatus,
        readonly sourceEventId: string,
        readonly recipient: string,
        readonly sentAt: Date | null,
        readonly createdAt: Date,
        readonly updatedAt: Date,
    ) {}

    static create(params: { title: string; content: string; type: INotificationType; sourceEventId: string; recipient: string }): Notification {
        const { title, content, type, sourceEventId, recipient } = params;

        const now = new Date();

        return new Notification(crypto.randomUUID(), title, content, type, INotificationStatus.PENDING, sourceEventId, recipient, null, now, now);
    }
}
