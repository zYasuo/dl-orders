import { applyDecorators, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardErrorResponseDto } from '@app/shared';
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
            ApiOperation({ summary: 'Create product' }),
            ApiBody({ type: CreateProductDto }),
            ApiResponse({ status: 201, description: 'Product created' }),
            standardError(400, 'Invalid input'),
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
