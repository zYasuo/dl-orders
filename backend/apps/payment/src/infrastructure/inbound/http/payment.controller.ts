import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { FindPaymentByOrderIdUseCase } from '../../../application/use-cases/find-payment-by-order-id.use-case';
import {
  HandleWebhookUseCase,
  IWebhookPayload,
} from '../../../application/use-cases/handle-webhook.use-case';
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
    if (!this.webhookSignatureService.isSecretConfigured()) {
      throw new ServiceUnavailableException(
        'MERCADOPAGO_WEBHOOK_SECRET is not configured; webhook endpoint is disabled',
      );
    }

    const dataId = payload?.data?.id;
    if (!dataId || String(dataId).trim() === '') {
      throw new BadRequestException(
        'Webhook payload must include data.id for signature verification (Mercado Pago resource id)',
      );
    }

    if (!this.webhookSignatureService.validate(String(dataId), xSignature, xRequestId)) {
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
