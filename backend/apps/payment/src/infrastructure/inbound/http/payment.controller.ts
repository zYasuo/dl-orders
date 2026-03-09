import { JwtAuthGuard, StandardErrorResponseDto } from '@app/shared';
import { BadRequestException, Body, Controller, Get, Headers, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FindPaymentByOrderIdUseCase } from '../../../application/use-cases/find-payment-by-order-id.use-case';
import { HandleWebhookUseCase, IWebhookPayload } from '../../../application/use-cases/handle-webhook.use-case';
import { WebhookSignatureService } from './webhook-signature.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    constructor(
        private readonly handleWebhookUseCase: HandleWebhookUseCase,
        private readonly findPaymentByOrderIdUseCase: FindPaymentByOrderIdUseCase,
        private readonly webhookSignatureService: WebhookSignatureService,
    ) {}

    @Post('webhook')
    @ApiOperation({ summary: 'Mercado Pago webhook' })
    @ApiHeader({ name: 'x-signature', required: false, description: 'Mercado Pago webhook signature' })
    @ApiHeader({ name: 'x-request-id', required: false, description: 'Mercado Pago request id' })
    @ApiBody({ description: 'Webhook payload from Mercado Pago' })
    @ApiResponse({ status: 200, description: 'Webhook processed' })
    @ApiResponse({ status: 400, description: 'Invalid payload (e.g. type payment without data.id)' })
    @ApiResponse({ status: 401, description: 'Invalid webhook signature' })
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

    @Get('order/:orderId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get payment by order ID' })
    @ApiParam({ name: 'orderId', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Payment info with checkout link' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Payment not found', type: StandardErrorResponseDto })
    getByOrderId(@Param('orderId') orderId: string) {
        return this.findPaymentByOrderIdUseCase.execute(orderId);
    }
}
