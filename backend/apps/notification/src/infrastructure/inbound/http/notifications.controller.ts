import { Controller, Param, Query } from '@nestjs/common';
import { IUserNotificationsPort } from '../../../domain/ports/user-notifications.port';
import { NotificationsDoc, ApiNotifications } from './docs/notifications-doc.decorator';

@ApiNotifications()
@Controller()
export class NotificationsController {
    constructor(private readonly userNotificationsPort: IUserNotificationsPort) {}

    @NotificationsDoc.GetByUserId()
    getByUserId(@Param('userId') userId: string, @Query('limit') limit?: string) {
        const limitNum = limit != null ? parseInt(limit, 10) : undefined;
        return this.userNotificationsPort.getByUserId(userId, limitNum);
    }
}
