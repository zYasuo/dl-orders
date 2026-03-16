import { BadRequestException, Body, Controller, Headers, Param, UnauthorizedException } from '@nestjs/common';
import { FindPaymentByOrderIdUseCase } from '../../../application/use-cases/find-payment-by-order-id.use-case';
import { HandleWebhookUseCase, IWebhookPayload } from '../../../application/use-cases/handle-webhook.use-case';
import { PaymentDoc, ApiPayments } from './docs/payment-doc.decorator';
import { WebhookSignatureService } from './webhook-signature.service';

@ApiPayments()
@Controller('payments')
export class PaymentController {
    constructor(
        private readonly handleWebhookUseCase: HandleWebhookUseCase,
        private readonly findPaymentByOrderIdUseCase: FindPaymentByOrderIdUseCase,
        private readonly webhookSignatureService: WebhookSignatureService,
    ) {}

    @PaymentDoc.Webhook()
    async webhook(
        @Body() payload: IWebhookPayload,
        @Headers('x-signature') xSignature: string | undefined,
        @Headers('x-request-id') xRequestId: string | undefined,
    ): Promise<{ received: boolean }> {
        if (payload?.type === 'payment' && !payload?.data?.id) {
            throw new BadRequestException('Webhook type payment requires data.id');
        }

        const dataId = payload?.data?.id;
        if (dataId && !this.webhookSignatureService.validate(dataId, xSignature, xRequestId)) {
            throw new UnauthorizedException('Invalid webhook signature');
        }

        await this.handleWebhookUseCase.execute(payload);
        return { received: true };
    }

    @PaymentDoc.GetByOrderId()
    getByOrderId(@Param('orderId') orderId: string) {
        return this.findPaymentByOrderIdUseCase.execute(orderId);
    }
}
