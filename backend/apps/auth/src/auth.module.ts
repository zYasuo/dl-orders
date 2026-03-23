import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { emailEncryptionConfig } from './config/email-encryption.config';
import { rateLimitConfig } from './config/rate-limit.config';
import { SigninUseCase } from './application/use-cases/signin.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { ValidateAuthAttemptUseCase } from './application/use-cases/validate-auth-attempt.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { AccountLockedNotifyPublisherPort } from './domain/ports/publishers/account-locked-notify-publisher.port';
import { AuthLogsRepositoryPort } from './domain/ports/repositories/auth-logs-repository.port';
import { LockoutStorePort } from './domain/ports/stores/lockout-store.port';
import { SessionStorePort } from './domain/ports/stores/session-store.port';
import { AuthUserRepositoryPort } from './domain/ports/repositories/auth-user-repository.port';
import { EmailEncryptedSecurity } from './domain/ports/security/email-encrypted.port';
import { JwtPort } from './domain/ports/security/jwt.port';
import { OtpRepositoryPort } from './domain/ports/repositories/otp-repository.port';
import { OtpSendRequestedPublisherPort } from './domain/ports/publishers/otp-send-requested-publisher.port';
import { PasswordHasherPort } from './domain/ports/security/password-hasher.port';
import { UserVerifiedPublisherPort } from './domain/ports/publishers/user-verified-publisher.port';
import { UserProfileProvisionerPort } from './domain/ports/user-profile-provisioner.port';
import { DbModule } from './infrastructure/db/db.module';
import { AuthController } from './infrastructure/inbound/http/auth.controller';
import { RedisRateLimitGuard } from './infrastructure/inbound/http/guards/redis-rate-limit.guard';
import { AccountLockedNotifyRabbitMqPublisher } from './infrastructure/outbound/messaging/account-locked-notify.publisher';
import { OtpSendRequestedRabbitMqPublisher } from './infrastructure/outbound/messaging/otp-send-requested.publisher';
import { HttpUserProfileProvisioner } from './infrastructure/outbound/http/http-user-profile-provisioner.adapter';
import { UserVerifiedRabbitMqPublisher } from './infrastructure/outbound/messaging/user-verified.publisher';
import { RedisLockoutStoreAdapter } from './infrastructure/outbound/persistence/redis/redis-lockout-store.adapter';
import { RedisSessionStoreAdapter } from './infrastructure/outbound/persistence/redis/redis-session-store.adapter';
import { AuthLogsRepository } from './infrastructure/outbound/persistence/sql/auth-logs.repository';
import { AuthUserRepository } from './infrastructure/outbound/persistence/sql/auth-user.repository';
import { OtpRepository } from './infrastructure/outbound/persistence/sql/otp.repository';
import { Argon2PasswordHasher } from './infrastructure/outbound/security/argon2-password-hasher.security';
import { EmailEncryptedSecurityAdapter } from './infrastructure/outbound/security/email-encrypted.security';
import { JwtService } from './infrastructure/outbound/security/jwt.service';
import { RabbitMQModule } from './infrastructure/outbound/rabbitmq/rabbitmq.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { CreateResetPasswordLinkUseCase } from './application/use-cases/create-reset-password-link.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { PasswordResetRepository } from './infrastructure/outbound/persistence/sql/password-reset.repository';
import { PasswordResetRepositoryPort } from './domain/ports/repositories/password-reset-repository.port';
import { ResetPasswordPublisherPort } from './domain/ports/publishers/reset-password-publisher.port';
import { PasswordChangedPublisherPort } from './domain/ports/publishers/password-changed-publisher.port';
import { PasswordResetLinkRequestRabbitMqPublisher } from './infrastructure/outbound/messaging/password-reset-link-request.publisher';
import { PasswordChangedRabbitMqPublisher } from './infrastructure/outbound/messaging/password-changed.publisher';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'apps/auth/.env',
      isGlobal: true,
      load: [emailEncryptionConfig, rateLimitConfig],
    }),
    DbModule,
    RabbitMQModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    RedisRateLimitGuard,
    SignupUseCase,
    SigninUseCase,
    VerifyOtpUseCase,
    ValidateAuthAttemptUseCase,
    CreateResetPasswordLinkUseCase,
    ChangePasswordUseCase,
    { provide: AuthUserRepositoryPort, useClass: AuthUserRepository },
    { provide: LockoutStorePort, useClass: RedisLockoutStoreAdapter },
    { provide: SessionStorePort, useClass: RedisSessionStoreAdapter },
    { provide: AuthLogsRepositoryPort, useClass: AuthLogsRepository },
    { provide: OtpRepositoryPort, useClass: OtpRepository },
    { provide: AccountLockedNotifyPublisherPort, useClass: AccountLockedNotifyRabbitMqPublisher },
    { provide: OtpSendRequestedPublisherPort, useClass: OtpSendRequestedRabbitMqPublisher },
    { provide: PasswordHasherPort, useClass: Argon2PasswordHasher },
    { provide: EmailEncryptedSecurity, useClass: EmailEncryptedSecurityAdapter },
    { provide: JwtPort, useClass: JwtService },
    { provide: UserVerifiedPublisherPort, useClass: UserVerifiedRabbitMqPublisher },
    { provide: UserProfileProvisionerPort, useClass: HttpUserProfileProvisioner },
    { provide: PasswordResetRepositoryPort, useClass: PasswordResetRepository },
    { provide: ResetPasswordPublisherPort, useClass: PasswordResetLinkRequestRabbitMqPublisher },
    { provide: PasswordChangedPublisherPort, useClass: PasswordChangedRabbitMqPublisher },
  ],
})
export class AuthModule {}

