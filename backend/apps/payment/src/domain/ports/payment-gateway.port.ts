export interface ICreatePreferenceInput {
  orderId: string;
  amount: number;
  title?: string;
  description?: string;
}

export interface IPreferenceResult {
  preferenceId: string;
  initPoint: string;
}

export interface IPaymentDetails {
  id: string;
  status: string;
  amount: number;
  dateApproved: string | null;
  orderId?: string;
}

export abstract class IPaymentGatewayPort {
  abstract createPreference(input: ICreatePreferenceInput): Promise<IPreferenceResult>;
  abstract getPayment(paymentId: string): Promise<IPaymentDetails | null>;
}
