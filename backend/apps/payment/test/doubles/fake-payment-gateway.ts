import { IPaymentGatewayPort, ICreatePreferenceInput, IPreferenceResult, IPaymentDetails } from '../../src/domain/ports/payment-gateway.port';

export class FakePaymentGateway extends IPaymentGatewayPort {
    readonly createdPreferences: ICreatePreferenceInput[] = [];
    private getPaymentResponses: Map<string, IPaymentDetails> = new Map();

    async createPreference(input: ICreatePreferenceInput): Promise<IPreferenceResult> {
        this.createdPreferences.push(input);
        return {
            preferenceId: `pref-${input.orderId}`,
            initPoint: `https://checkout.example.com/${input.orderId}`,
        };
    }

    async getPayment(paymentId: string): Promise<IPaymentDetails | null> {
        return this.getPaymentResponses.get(paymentId) ?? null;
    }

    setPaymentResponse(paymentId: string, details: IPaymentDetails): void {
        this.getPaymentResponses.set(paymentId, details);
    }
}
