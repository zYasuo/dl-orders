import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { emailEncryptionConfig } from './config/email-encryption.config';
import { SigninUseCase } from './application/use-cases/signin.use-case';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';
import { IAuthUserRepositoryPort } from './domain/ports/auth-user-repository.port';
import { IEmailEncryptedSecurity } from './domain/ports/email-encrypted.security';
import { IJwtPort } from './domain/ports/jwt.port';
import { IOtpRepositoryPort } from './domain/ports/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from './domain/ports/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from './domain/ports/password-hasher.port';
import { IUserVerifiedPublisherPort } from './domain/ports/user-verified-publisher.port';
import { DbModule } from './infrastructure/db/db.module';
import { AuthController } from './infrastructure/inbound/http/auth.controller';
import { OtpSendRequestedRabbitMqPublisher } from './infrastructure/outbound/messaging/otp-send-requested.publisher';
import { UserVerifiedRabbitMqPublisher } from './infrastructure/outbound/messaging/user-verified.publisher';
import { AuthUserRepository } from './infrastructure/outbound/persistence/sql/auth-user.repository';
import { OtpRepository } from './infrastructure/outbound/persistence/sql/otp.repository';
import { Argon2PasswordHasher } from './infrastructure/outbound/security/argon2-password-hasher.security';
import { EmailEncryptedSecurity } from './infrastructure/outbound/security/email-encrypted.security';
import { JwtService } from './infrastructure/outbound/security/jwt.service';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/auth/.env',
            isGlobal: true,
            load: [emailEncryptionConfig],
        }),
        DbModule,
        RabbitMQModule,
    ],
    controllers: [AuthController],
    providers: [
        SignupUseCase,
        SigninUseCase,
        VerifyOtpUseCase,
        { provide: IAuthUserRepositoryPort, useClass: AuthUserRepository },
        { provide: IOtpRepositoryPort, useClass: OtpRepository },
        { provide: IOtpSendRequestedPublisherPort, useClass: OtpSendRequestedRabbitMqPublisher },
        { provide: IPasswordHasherPort, useClass: Argon2PasswordHasher },
        { provide: IEmailEncryptedSecurity, useClass: EmailEncryptedSecurity },
        { provide: IJwtPort, useClass: JwtService },
        { provide: IUserVerifiedPublisherPort, useClass: UserVerifiedRabbitMqPublisher },
    ],
})
export class AuthModule {}
