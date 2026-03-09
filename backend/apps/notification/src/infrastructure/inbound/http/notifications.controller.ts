import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IUserNotificationsPort } from '../../../domain/ports/user-notifications.port';

@ApiTags('Notifications')
@Controller()
export class NotificationsController {
    constructor(private readonly userNotificationsPort: IUserNotificationsPort) {}

    @Get('users/:userId/notifications')
    @ApiOperation({ summary: 'User notifications' })
    @ApiParam({ name: 'userId', description: 'User ID' })
    @ApiQuery({ name: 'limit', required: false, description: 'Max number of notifications to return' })
    @ApiResponse({ status: 200, description: 'List of notifications' })
    getByUserId(
        @Param('userId') userId: string,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit != null ? parseInt(limit, 10) : undefined;
        return this.userNotificationsPort.getByUserId(userId, limitNum);
    }
}
