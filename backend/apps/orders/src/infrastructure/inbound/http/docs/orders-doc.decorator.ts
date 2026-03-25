import { applyDecorators, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceOrJwtAuthGuard, StandardErrorResponseDto } from '@app/shared';
import { CreateOrderDto } from '../../../../application/dto/create-order.dto';

export const ApiOrders = () =>
  applyDecorators(ApiTags('Orders'), ApiBearerAuth(), UseGuards(ServiceOrJwtAuthGuard));

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
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  List: () =>
    applyDecorators(
      Get(),
      ApiOperation({ summary: 'List orders with pagination' }),
      ApiResponse({ status: 200, description: 'Paginated list of orders' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  AuditLog: () =>
    applyDecorators(
      Get(':id/audit-log'),
      ApiOperation({ summary: 'Order audit log' }),
      idParam(),
      ApiResponse({ status: 200, description: 'List of audit events' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  Summary: () =>
    applyDecorators(
      Get(':id/summary'),
      ApiOperation({ summary: 'Order summary' }),
      idParam(),
      ApiResponse({ status: 200, description: 'Order summary' }),
      standardError(404, 'Order not found'),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  GetById: () =>
    applyDecorators(
      Get(':id'),
      ApiOperation({ summary: 'Get order by ID' }),
      idParam(),
      ApiResponse({ status: 200, description: 'Order found' }),
      standardError(404, 'Order not found'),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),
};
