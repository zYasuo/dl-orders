import { applyDecorators, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@app/shared';

export const ApiNotifications = () => applyDecorators(ApiTags('Notifications'));

export const NotificationsDoc = {
  GetMine: () =>
    applyDecorators(
      Get('users/me/notifications'),
      UseGuards(JwtAuthGuard),
      ApiBearerAuth(),
      ApiOperation({ summary: 'Notifications for the authenticated user' }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max number of notifications to return (1–100)',
      }),
      ApiResponse({ status: 200, description: 'List of notifications' }),
      ApiResponse({ status: 400, description: 'Invalid limit query' }),
      ApiResponse({ status: 401, description: 'Unauthorized' }),
    ),
};
