export type TOrderSummary = {
    orderId: string;
    status: string;
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
    createdAt: string;
    updatedAt: string;
};

export abstract class IOrderSummaryPort {
    abstract put(summary: TOrderSummary): Promise<void>;
    abstract getByOrderId(orderId: string): Promise<TOrderSummary | null>;
}
