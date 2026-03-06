import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    IUserNotificationsPort,
    TUserNotificationItem,
} from '../../../../domain/ports/user-notifications.port';

@Injectable()
export class DynamoDBUserNotificationsRepository extends IUserNotificationsPort {
    private readonly tableName: string;

    constructor(
        private readonly docClient: DynamoDBDocumentClient,
        configService: ConfigService,
    ) {
        super();
        this.tableName = configService.getOrThrow<string>('DYNAMODB_USER_NOTIFICATIONS_TABLE');
    }

    async add(item: TUserNotificationItem): Promise<void> {
        await this.docClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: {
                    userId: item.userId,
                    timestamp: item.timestamp,
                    notificationId: item.notificationId,
                    orderId: item.orderId,
                    title: item.title,
                    content: item.content,
                    read: item.read,
                },
            }),
        );
    }

    async getByUserId(userId: string, limit = 20): Promise<TUserNotificationItem[]> {
        const result = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: { ':userId': userId },
                ScanIndexForward: false,
                Limit: limit,
            }),
        );

        const items = (result.Items ?? []) as Array<{
            userId: string;
            timestamp: string;
            notificationId: string;
            orderId: string;
            title: string;
            content: string;
            read: boolean;
        }>;

        return items.map((item) => ({
            userId: item.userId,
            timestamp: item.timestamp,
            notificationId: item.notificationId,
            orderId: item.orderId,
            title: item.title,
            content: item.content,
            read: item.read ?? false,
        }));
    }
}
