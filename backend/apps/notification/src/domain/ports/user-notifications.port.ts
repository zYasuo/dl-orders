export type TUserNotificationItem = {
    userId: string;
    timestamp: string;
    notificationId: string;
    orderId: string;
    title: string;
    content: string;
    read: boolean;
};

export abstract class IUserNotificationsPort {
    abstract add(item: TUserNotificationItem): Promise<void>;
    abstract getByUserId(userId: string, limit?: number): Promise<TUserNotificationItem[]>;
}
