import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardErrorResponseDto } from '@app/shared';
import { CreateInventoryDto } from '../../../../application/dto/create-inventory.schema';

export const ApiInventories = () => applyDecorators(ApiTags('Inventories'));

const standardError = (status: number, description: string) =>
  ApiResponse({ status, description, type: StandardErrorResponseDto });

export const InventoryDoc = {
  Create: () =>
    applyDecorators(
      Post(),
      ApiOperation({ summary: 'Create inventory item' }),
      ApiBody({ type: CreateInventoryDto }),
      ApiResponse({ status: 201, description: 'Inventory item created' }),
      standardError(400, 'Invalid input'),
    ),

  ReservationAuditLog: () =>
    applyDecorators(
      Get('reservations/:orderId/audit-log'),
      ApiOperation({ summary: 'Reservation audit log for order' }),
      ApiParam({ name: 'orderId', description: 'Order ID' }),
      ApiResponse({ status: 200, description: 'List of reservation audit events' }),
    ),

  List: () =>
    applyDecorators(
      Get(),
      ApiOperation({ summary: 'Get all inventory items' }),
      ApiResponse({ status: 200, description: 'List of inventory items' }),
    ),
};
