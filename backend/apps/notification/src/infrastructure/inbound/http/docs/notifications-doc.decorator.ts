import { applyDecorators, Get } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ApiNotifications = () => applyDecorators(ApiTags('Notifications'));

export const NotificationsDoc = {
  GetByUserId: () =>
    applyDecorators(
      Get('users/:userId/notifications'),
      ApiOperation({ summary: 'User notifications' }),
      ApiParam({ name: 'userId', description: 'User ID' }),
      ApiQuery({
        name: 'limit',
        required: false,
        description: 'Max number of notifications to return',
      }),
      ApiResponse({ status: 200, description: 'List of notifications' }),
    ),
};
