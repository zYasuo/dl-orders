import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from '@app/shared';
import { DbModule } from './infrastructure/db/db.module';
import { UserProfileRepositoryPort } from './domain/ports/user-profile-repository.port';
import { JwtPort } from './domain/ports/jwt.port';
import { InternalUserProfileController } from './infrastructure/inbound/http/internal-user-profile.controller';
import { InternalApiSecretGuard } from './infrastructure/inbound/http/guards/internal-api-secret.guard';
import { UsersController } from './infrastructure/inbound/http/users.controller';
import { UserVerifiedConsumer } from './infrastructure/inbound/messaging/user-verified.consumer';
import { UserProfileRepository } from './infrastructure/outbound/persistence/sql/user-profile.repository';
import { JwtService } from './infrastructure/outbound/security/jwt.service';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { ProvisionUserProfileUseCase } from './application/use-cases/provision-user-profile.use-case';
import { UpdateUserProfileUseCase } from './application/use-cases/update-user-profile.use-case';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/users/.env',
      isGlobal: true,
    }),
    DbModule,
  ],
  controllers: [UsersController, InternalUserProfileController, UserVerifiedConsumer],
  providers: [
    JwtAuthGuard,
    InternalApiSecretGuard,
    GetUserProfileUseCase,
    ProvisionUserProfileUseCase,
    UpdateUserProfileUseCase,
    { provide: UserProfileRepositoryPort, useClass: UserProfileRepository },
    { provide: JwtPort, useClass: JwtService },
  ],
})
export class UsersModule {}
