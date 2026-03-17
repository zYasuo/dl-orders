import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ICreatePreferenceInput, IPaymentDetails, IPaymentGatewayPort, IPreferenceResult } from '../../../domain/ports/payment-gateway.port';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class MercadoPagoGatewayAdapter extends IPaymentGatewayPort {
    private readonly client: import('mercadopago').MercadoPagoConfig;
    private readonly preference: import('mercadopago').Preference;
    private readonly payment: import('mercadopago').Payment;

    constructor(private readonly configService: ConfigService) {
        super();
        const accessToken = this.configService.getOrThrow<string>('MERCADOPAGO_ACCESS_TOKEN');

        this.client = new MercadoPagoConfig({ accessToken });

        this.preference = new Preference(this.client);

        this.payment = new Payment(this.client);
    }

    async createPreference(input: ICreatePreferenceInput): Promise<IPreferenceResult> {
        const response = await this.preference.create({
            body: {
                items: [
                    {
                        id: input.orderId,
                        title: input.title ?? `Order ${input.orderId}`,
                        description: input.description ?? '',
                        quantity: 1,
                        unit_price: input.amount,
                        currency_id: 'BRL',
                    },
                ],
                external_reference: input.orderId,

                back_urls: {
                    success: this.configService.get<string>('MERCADOPAGO_BACK_URL_SUCCESS'),
                    failure: this.configService.get<string>('MERCADOPAGO_BACK_URL_FAILURE'),
                    pending: this.configService.get<string>('MERCADOPAGO_BACK_URL_PENDING'),
                },
            },
        });

        const body = response as { id?: string; init_point?: string };

        if (!body?.id || !body?.init_point) {
            throw new Error('Mercado Pago preference response missing id or init_point');
        }

        return {
            preferenceId: body.id,
            initPoint: body.init_point,
        };
    }

    async getPayment(paymentId: string): Promise<IPaymentDetails | null> {
        try {
            const response = (await this.payment.get({ id: paymentId })) as {
                id?: number;
                status?: string;
                transaction_amount?: number;
                date_approved?: string | null;
                external_reference?: string | null;
            };

            const body = typeof response === 'object' && response !== null ? response : {};
            const id = body.id ?? paymentId;

            const status = body.status ?? '';
            const amount = Number(body.transaction_amount) || 0;

            const dateApproved = body.date_approved ?? null;
            const orderId = body.external_reference ?? undefined;

            return {
                id: String(id),
                status,
                amount,
                dateApproved: dateApproved ? String(dateApproved) : null,
                orderId: orderId ? String(orderId) : undefined,
            };
        } catch (err) {
            if (err && typeof err === 'object' && 'cause' in err && (err as { cause?: { status?: number } }).cause?.status === 404) {
                return null;
            }
            throw err;
        }
    }
}
