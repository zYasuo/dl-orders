import { applyDecorators, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, StandardErrorResponseDto } from '@app/shared';
import { UpdateUserProfileDto } from '../../../../application/dto/update-user-profile.dto';

export const ApiUsers = () =>
    applyDecorators(ApiTags('Users'), ApiBearerAuth(), UseGuards(JwtAuthGuard));

const standardError = (status: number, description: string) =>
    ApiResponse({ status, description, type: StandardErrorResponseDto });

export const UsersDoc = {
    GetProfile: () =>
        applyDecorators(
            Get('me'),
            ApiOperation({ summary: 'Authenticated user profile' }),
            ApiResponse({ status: 200, description: 'Profile data' }),
            standardError(401, 'Unauthorized'),
        ),

    UpdateProfile: () =>
        applyDecorators(
            Patch('me'),
            ApiOperation({ summary: 'Update profile' }),
            ApiBody({ type: UpdateUserProfileDto }),
            ApiResponse({ status: 200, description: 'Profile updated' }),
            standardError(400, 'Invalid input'),
            standardError(401, 'Unauthorized'),
        ),
};
