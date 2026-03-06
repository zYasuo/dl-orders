import { CurrentUser, JwtAuthGuard, TJwtPayload, ZodValidationPipe } from '@app/shared';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SUpdateUserProfile, type TUpdateUserProfileDto } from '../../../application/dto/update-user-profile.dto';
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/update-user-profile.use-case';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    ) {}

    @Get('me')
    async getMe(@CurrentUser() user: TJwtPayload) {
        const { sub } = user;

        const profile = await this.getUserProfileUseCase.execute(sub);

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }

    @Patch('me')
    async updateMe(@CurrentUser() user: TJwtPayload, @Body(new ZodValidationPipe(SUpdateUserProfile)) body: TUpdateUserProfileDto) {
        const { sub } = user;

        const profile = await this.updateUserProfileUseCase.execute(sub, body);

        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        };
    }
}
