import {
    CurrentUser,
    JwtAuthGuard,
    StandardErrorResponseDto,
    TJwtPayload,
    ZodValidationPipe,
} from '@app/shared';
import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SUpdateUserProfile, type TUpdateUserProfileDto, UpdateUserProfileDto } from '../../../application/dto/update-user-profile.dto';
import { GetUserProfileUseCase } from '../../../application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/update-user-profile.use-case';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly getUserProfileUseCase: GetUserProfileUseCase,
        private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    ) {}

    @Get('me')
    @ApiOperation({ summary: 'Authenticated user profile' })
    @ApiResponse({ status: 200, description: 'Profile data' })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: StandardErrorResponseDto })
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
    @ApiOperation({ summary: 'Update profile' })
    @ApiBody({ type: UpdateUserProfileDto })
    @ApiResponse({ status: 200, description: 'Profile updated' })
    @ApiResponse({ status: 400, description: 'Invalid input', type: StandardErrorResponseDto })
    @ApiResponse({ status: 401, description: 'Unauthorized', type: StandardErrorResponseDto })
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
