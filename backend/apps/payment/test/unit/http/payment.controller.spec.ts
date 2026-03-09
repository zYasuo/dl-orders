import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

jest.mock('@app/shared', () => ({
    JwtAuthGuard: class {},
    StandardErrorResponseDto: class {},
}));

import { PaymentController } from '../../../src/infrastructure/inbound/http/payment.controller';
import { HandleWebhookUseCase } from '../../../src/application/use-cases/handle-webhook.use-case';
import { FindPaymentByOrderIdUseCase } from '../../../src/application/use-cases/find-payment-by-order-id.use-case';
import { WebhookSignatureService } from '../../../src/infrastructure/inbound/http/webhook-signature.service';

describe('PaymentController', () => {
    let controller: PaymentController;
    let webhookSignatureService: jest.Mocked<WebhookSignatureService>;

    beforeEach(async () => {
        webhookSignatureService = {
            validate: jest.fn().mockReturnValue(true),
        } as unknown as jest.Mocked<WebhookSignatureService>;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [
                {
                    provide: HandleWebhookUseCase,
                    useValue: { execute: jest.fn().mockResolvedValue(undefined) },
                },
                {
                    provide: FindPaymentByOrderIdUseCase,
                    useValue: { execute: jest.fn().mockResolvedValue({}) },
                },
                {
                    provide: WebhookSignatureService,
                    useValue: webhookSignatureService,
                },
            ],
        }).compile();

        controller = module.get(PaymentController);
    });

    describe('webhook', () => {
        it('returns 200 when payload is valid and signature is valid', async () => {
            const result = await controller.webhook(
                { type: 'payment', data: { id: 'mp-123' } },
                'ts=1,v1=abc',
                'req-1',
            );
            expect(result).toEqual({ received: true });
            expect(webhookSignatureService.validate).toHaveBeenCalledWith('mp-123', 'ts=1,v1=abc', 'req-1');
        });

        it('throws UnauthorizedException when signature is invalid', async () => {
            webhookSignatureService.validate.mockReturnValue(false);

            await expect(
                controller.webhook({ type: 'payment', data: { id: 'mp-123' } }, 'ts=1,v1=wrong', 'req-1'),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                controller.webhook({ type: 'payment', data: { id: 'mp-123' } }, 'ts=1,v1=wrong', 'req-1'),
            ).rejects.toThrow('Invalid webhook signature');
        });

        it('throws BadRequestException when type is payment but data.id is missing', async () => {
            await expect(
                controller.webhook({ type: 'payment', data: {} as { id: string } }, undefined, undefined),
            ).rejects.toThrow(BadRequestException);
            await expect(
                controller.webhook({ type: 'payment', data: {} as { id: string } }, undefined, undefined),
            ).rejects.toThrow('Webhook type payment requires data.id');
        });

        it('accepts non-payment type without data.id and does not require signature validation', async () => {
            const result = await controller.webhook(
                { type: 'merchant_order', data: {} as { id: string } },
                undefined,
                undefined,
            );
            expect(result).toEqual({ received: true });
            expect(webhookSignatureService.validate).not.toHaveBeenCalled();
        });
    });
});
