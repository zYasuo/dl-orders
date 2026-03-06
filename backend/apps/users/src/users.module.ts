import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { IUserProfileRepositoryPort } from './domain/ports/user-profile-repository.port';
import { IJwtPort } from './domain/ports/jwt.port';
import { UsersController } from './infrastructure/inbound/http/users.controller';
import { UserVerifiedConsumer } from './infrastructure/inbound/messaging/user-verified.consumer';
import { UserProfileRepository } from './infrastructure/outbound/persistence/sql/user-profile.repository';
import { JwtService } from './infrastructure/outbound/security/jwt.service';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/users/.env',
            isGlobal: true,
        }),
        DbModule,
    ],
    controllers: [UsersController, UserVerifiedConsumer],
    providers: [
        JwtAuthGuard,
        GetUserProfileUseCase,
        UpdateUserProfileUseCase,
        { provide: IUserProfileRepositoryPort, useClass: UserProfileRepository },
        { provide: IJwtPort, useClass: JwtService },
    ],
})
export class UsersModule {}
