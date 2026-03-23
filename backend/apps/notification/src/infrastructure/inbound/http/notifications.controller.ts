import { Controller, Query } from '@nestjs/common';
import { CurrentUser, TJwtPayload } from '@app/shared';
import { UserNotificationsPort } from '../../../domain/ports/user-notifications.port';
import { NotificationsDoc, ApiNotifications } from './docs/notifications-doc.decorator';
import { parseNotificationLimit } from './utils/parse-notification-limit.util';

@ApiNotifications()
@Controller()
export class NotificationsController {
  constructor(private readonly userNotificationsPort: UserNotificationsPort) {}

  @NotificationsDoc.GetMine()
  getMine(@CurrentUser() user: TJwtPayload, @Query('limit') limit?: string) {
    const limitNum = parseNotificationLimit(limit);
    return this.userNotificationsPort.getByUserId(user.sub, limitNum);
  }
}
