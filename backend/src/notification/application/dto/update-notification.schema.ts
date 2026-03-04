import { z } from 'zod';
import { INotificationStatus } from 'src/notification/domain/entities/notification.entity';

export const SUpdateNotification = z.object({
    status: z.enum(INotificationStatus).optional(),
    sentAt: z.date().nullable().optional(),
    updatedAt: z.date().optional(),
});

export type TUpdateNotification = z.infer<typeof SUpdateNotification>;
