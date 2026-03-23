import { applyDecorators, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, StandardErrorResponseDto } from '@app/shared';

export const ApiPayments = () => applyDecorators(ApiTags('Payments'));

const standardError = (status: number, description: string) =>
  ApiResponse({ status, description, type: StandardErrorResponseDto });

export const PaymentDoc = {
  Webhook: () =>
    applyDecorators(
      Post('webhook'),
      ApiOperation({ summary: 'Mercado Pago webhook' }),
      ApiHeader({
        name: 'x-signature',
        required: true,
        description: 'Mercado Pago webhook signature (ts=...,v1=...)',
      }),
      ApiHeader({ name: 'x-request-id', required: false, description: 'Mercado Pago request id' }),
      ApiBody({ description: 'Webhook payload from Mercado Pago (must include data.id)' }),
      ApiResponse({ status: 200, description: 'Webhook processed' }),
      ApiResponse({
        status: 400,
        description: 'Invalid payload (missing data.id for signature verification)',
      }),
      ApiResponse({ status: 401, description: 'Invalid webhook signature' }),
      ApiResponse({
        status: 503,
        description: 'MERCADOPAGO_WEBHOOK_SECRET not configured',
      }),
    ),

  GetByOrderId: () =>
    applyDecorators(
      Get('order/:orderId'),
      UseGuards(JwtAuthGuard),
      ApiBearerAuth(),
      ApiOperation({ summary: 'Get payment by order ID' }),
      ApiParam({ name: 'orderId', description: 'Order ID' }),
      ApiResponse({ status: 200, description: 'Payment info with checkout link' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
      standardError(404, 'Payment not found'),
    ),
};
