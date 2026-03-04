import { z } from 'zod';
import { INotificationType } from 'src/notification/domain/entities/notification.entity';

export const SCreateNotification = z.object({
    title: z.string().min(1, 'title is required'),
    content: z.string().min(1, 'content is required'),
    type: z.enum(INotificationType),
    sourceEventId: z.string().min(1, 'sourceEventId is required'),
    recipient: z.string().min(1, 'recipient is required'),
});

export type TCreateNotification = z.infer<typeof SCreateNotification>;
