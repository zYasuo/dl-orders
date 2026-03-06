import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOrderSummaryPort, TOrderSummary } from '../../../../domain/ports/order-summary.port';

@Injectable()
export class DynamoDBOrderSummaryRepository extends IOrderSummaryPort {
    private readonly tableName: string;

    constructor(
        private readonly docClient: DynamoDBDocumentClient,
        configService: ConfigService,
    ) {
        super();
        this.tableName = configService.getOrThrow<string>('DYNAMODB_ORDER_SUMMARY_TABLE');
    }

    async put(summary: TOrderSummary): Promise<void> {
        await this.docClient.send(
            new PutCommand({
                TableName: this.tableName,
                Item: summary,
            }),
        );
    }

    async getByOrderId(orderId: string): Promise<TOrderSummary | null> {
        const result = await this.docClient.send(
            new GetCommand({
                TableName: this.tableName,
                Key: { orderId },
            }),
        );

        return (result.Item as TOrderSummary) ?? null;
    }
}
