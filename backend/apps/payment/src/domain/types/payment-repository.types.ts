export interface ICreatePayment {
    orderId: string;
    amount: number;
    preferenceId?: string | null;
    externalId?: string | null;
}

export interface IUpdatePaymentStatus {
    status: string;
    externalId?: string | null;
    preferenceId?: string | null;
    gatewayResponse?: Record<string, unknown> | null;
}
