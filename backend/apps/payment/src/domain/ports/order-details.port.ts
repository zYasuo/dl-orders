export interface IOrderDetails {
    orderId: string;
    totalPrice: number;
}

export abstract class IOrderDetailsPort {
    abstract getByOrderId(orderId: string): Promise<IOrderDetails | null>;
}
