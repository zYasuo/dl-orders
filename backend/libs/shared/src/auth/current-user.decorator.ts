import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TJwtPayload } from './jwt-auth.guard';

export const CurrentUser = createParamDecorator<TJwtPayload | undefined>(
    (_data: unknown, ctx: ExecutionContext): TJwtPayload => {
        const request = ctx.switchToHttp().getRequest<{ user?: TJwtPayload }>();
        const user = request.user;
        if (!user) {
            return undefined as unknown as TJwtPayload;
        }
        return user;
    },
);
