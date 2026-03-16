import { applyDecorators, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardErrorResponseDto } from '@app/shared';
import { CreateOrderDto } from '../../../../application/dto/create-order.dto';

export const ApiOrders = () => applyDecorators(ApiTags('Orders'));

const idParam = () => ApiParam({ name: 'id', description: 'Order ID' });
const standardError = (status: number, description: string) =>
    ApiResponse({ status, description, type: StandardErrorResponseDto });

export const OrdersDoc = {
    Create: () =>
        applyDecorators(
            Post(),
            HttpCode(HttpStatus.ACCEPTED),
            ApiOperation({ summary: 'Create order' }),
            ApiBody({ type: CreateOrderDto }),
            ApiResponse({ status: 202, description: 'Order accepted for processing' }),
            standardError(400, 'Invalid input'),
        ),

    AuditLog: () =>
        applyDecorators(
            Get(':id/audit-log'),
            ApiOperation({ summary: 'Order audit log' }),
            idParam(),
            ApiResponse({ status: 200, description: 'List of audit events' }),
        ),

    Summary: () =>
        applyDecorators(
            Get(':id/summary'),
            ApiOperation({ summary: 'Order summary' }),
            idParam(),
            ApiResponse({ status: 200, description: 'Order summary' }),
            standardError(404, 'Order not found'),
        ),

    GetById: () =>
        applyDecorators(
            Get(':id'),
            ApiOperation({ summary: 'Get order by ID' }),
            idParam(),
            ApiResponse({ status: 200, description: 'Order found' }),
            standardError(404, 'Order not found'),
        ),
};
