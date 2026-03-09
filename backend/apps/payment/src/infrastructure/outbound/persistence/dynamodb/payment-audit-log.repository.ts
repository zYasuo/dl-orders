import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentAuditLogPort, TPaymentAuditEvent } from '../../../../domain/ports/payment-audit-log.port';

@Injectable()
export class DynamoDBPaymentAuditLogRepository extends IPaymentAuditLogPort {
    private readonly tableName: string;

    constructor(
        private readonly docClient: DynamoDBDocumentClient,
        configService: ConfigService,
    ) {
        super();
        this.tableName = configService.getOrThrow<string>('DYNAMODB_AUDIT_TABLE');
    }

    async log(event: TPaymentAuditEvent): Promise<void> {
        const { orderId, timestamp, action, details } = event;

        await this.docClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: {
                    orderId,
                    timestamp,
                    action,
                    details,
                },
            }),
        );
    }

    async getByOrderId(orderId: string): Promise<TPaymentAuditEvent[]> {
        const result = await this.docClient.send(
            new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'orderId = :orderId',
                ExpressionAttributeValues: { ':orderId': orderId },
            }),
        );

        const items = (result.Items ?? []) as Array<{
            orderId: string;
            timestamp: string;
            action: string;
            details: Record<string, unknown>;
        }>;

        return items
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
            .map((item) => ({
                orderId: item.orderId,
                action: item.action,
                timestamp: item.timestamp,
                details: item.details ?? {},
            }));
    }
}
