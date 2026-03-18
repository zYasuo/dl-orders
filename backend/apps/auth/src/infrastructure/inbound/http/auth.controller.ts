import { Body, Controller, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ZodValidationPipe } from '@app/shared';
import { SSignin, type TSignin } from '../../../application/dto/signin.dto';
import { SSignup, type TSignup } from '../../../application/dto/signup.dto';
import { SVerifyOtp, type TVerifyOtp } from '../../../application/dto/verify-otp.dto';
import { SigninUseCase } from '../../../application/use-cases/signin.use-case';
import { SignupUseCase } from '../../../application/use-cases/signup.use-case';
import { VerifyOtpUseCase } from '../../../application/use-cases/verify-otp.use-case';
import { AuthDoc, ApiAuth } from './docs/auth-doc.decorator';
import { RedisRateLimitGuard } from './guards/redis-rate-limit.guard';
import { CreateResetPasswordLinkUseCase } from 'apps/auth/src/application/use-cases/create-reset-password-link.use-case';
import {
  SCreateResetPasswordLinkDto,
  TCreateResetPasswordLink,
} from 'apps/auth/src/application/dto/create-reset-password-link.dto';
import { ChangePasswordUseCase } from '../../../application/use-cases/change-password.use-case';
import {
  SChangePasswordDto,
  type TChangePassword,
} from '../../../application/dto/change-password.dto';

@ApiAuth()
@Controller('auth')
@UseGuards(RedisRateLimitGuard)
export class AuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly signinUseCase: SigninUseCase,
    private readonly createResetPasswordLinkUseCase: CreateResetPasswordLinkUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @AuthDoc.Signup()
  signup(@Body(new ZodValidationPipe(SSignup)) dto: TSignup) {
    return this.signupUseCase.execute(dto);
  }

  @AuthDoc.VerifyOtp()
  verifyOtp(@Body(new ZodValidationPipe(SVerifyOtp)) dto: TVerifyOtp) {
    return this.verifyOtpUseCase.execute(dto);
  }

  @AuthDoc.Signin()
  signin(@Req() req: Request, @Body(new ZodValidationPipe(SSignin)) dto: TSignin) {
    const ip =
      req.ip ??
      req.socket?.remoteAddress ??
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      undefined;
    return this.signinUseCase.execute({ ...dto, ip });
  }

  @AuthDoc.CreateResetPasswordLink()
  createResetPasswordLink(
    @Body(new ZodValidationPipe(SCreateResetPasswordLinkDto)) dto: TCreateResetPasswordLink,
  ) {
    return this.createResetPasswordLinkUseCase.execute(dto);
  }

  @AuthDoc.ChangePassword()
  changePassword(@Body(new ZodValidationPipe(SChangePasswordDto)) dto: TChangePassword) {
    return this.changePasswordUseCase.execute(dto);
  }
}
