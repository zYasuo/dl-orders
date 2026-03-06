import { Controller, Get, Param, Query } from '@nestjs/common';
import { IUserNotificationsPort } from '../../../domain/ports/user-notifications.port';

@Controller()
export class NotificationsController {
    constructor(private readonly userNotificationsPort: IUserNotificationsPort) {}

    @Get('users/:userId/notifications')
    getByUserId(
        @Param('userId') userId: string,
        @Query('limit') limit?: string,
    ) {
        const limitNum = limit != null ? parseInt(limit, 10) : undefined;
        return this.userNotificationsPort.getByUserId(userId, limitNum);
    }
}
