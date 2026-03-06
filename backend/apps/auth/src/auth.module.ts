import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './infrastructure/db/db.module';
import { RabbitMQModule } from './infrastructure/rabbitmq/rabbitmq.module';
import { IAuthUserRepositoryPort } from './domain/ports/auth-user-repository.port';
import { IJwtPort } from './domain/ports/jwt.port';
import { IOtpRepositoryPort } from './domain/ports/otp-repository.port';
import { IOtpSendRequestedPublisherPort } from './domain/ports/otp-send-requested-publisher.port';
import { IPasswordHasherPort } from './domain/ports/password-hasher.port';
import { IUserVerifiedPublisherPort } from './domain/ports/user-verified-publisher.port';
import { AuthController } from './infrastructure/inbound/http/auth.controller';
import { OtpSendRequestedRabbitMqPublisher } from './infrastructure/outbound/messaging/otp-send-requested.publisher';
import { AuthUserRepository } from './infrastructure/outbound/persistence/sql/auth-user.repository';
import { OtpRepository } from './infrastructure/outbound/persistence/sql/otp.repository';
import { Argon2PasswordHasher } from './infrastructure/outbound/security/argon2-password-hasher';
import { JwtService } from './infrastructure/outbound/security/jwt.service';
import { UserVerifiedRabbitMqPublisher } from './infrastructure/outbound/messaging/user-verified.publisher';
import { SignupUseCase } from './application/use-cases/signup.use-case';
import { SigninUseCase } from './application/use-cases/signin.use-case';
import { VerifyOtpUseCase } from './application/use-cases/verify-otp.use-case';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: 'apps/auth/.env',
            isGlobal: true,
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
        { provide: IJwtPort, useClass: JwtService },
        { provide: IUserVerifiedPublisherPort, useClass: UserVerifiedRabbitMqPublisher },
    ],
})
export class AuthModule {}
