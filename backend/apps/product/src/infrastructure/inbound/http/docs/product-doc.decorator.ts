import { applyDecorators, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, StandardErrorResponseDto } from '@app/shared';
import { CreateProductDto } from '../../../../application/dto/create-product.schema';

export const ApiProducts = () => applyDecorators(ApiTags('Products'));

const standardError = (status: number, description: string) =>
  ApiResponse({ status, description, type: StandardErrorResponseDto });

export const ProductDoc = {
  List: () =>
    applyDecorators(
      Get(),
      ApiOperation({ summary: 'List all products' }),
      ApiResponse({ status: 200, description: 'Products list' }),
    ),

  Create: () =>
    applyDecorators(
      Post(),
      UseGuards(JwtAuthGuard),
      ApiBearerAuth(),
      ApiOperation({ summary: 'Create product (requires JWT; catalog reads stay public)' }),
      ApiBody({ type: CreateProductDto }),
      ApiResponse({ status: 201, description: 'Product created' }),
      standardError(400, 'Invalid input'),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),

  GetById: () =>
    applyDecorators(
      Get(':id'),
      ApiOperation({ summary: 'Get product by ID' }),
      ApiParam({ name: 'id', description: 'Product ID' }),
      ApiResponse({ status: 200, description: 'Product found' }),
      standardError(404, 'Product not found'),
    ),
};
