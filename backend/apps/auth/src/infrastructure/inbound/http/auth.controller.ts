import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodValidationPipe } from '@app/shared';
import { SSignin, type TSignin } from '../../../application/dto/signin.dto';
import { SSignup, type TSignup } from '../../../application/dto/signup.dto';
import { SVerifyOtp, type TVerifyOtp } from '../../../application/dto/verify-otp.dto';
import { SigninUseCase } from '../../../application/use-cases/signin.use-case';
import { SignupUseCase } from '../../../application/use-cases/signup.use-case';
import { VerifyOtpUseCase } from '../../../application/use-cases/verify-otp.use-case';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly signupUseCase: SignupUseCase,
        private readonly verifyOtpUseCase: VerifyOtpUseCase,
        private readonly signinUseCase: SigninUseCase,
    ) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    signup(@Body(new ZodValidationPipe(SSignup)) dto: TSignup) {
        return this.signupUseCase.execute(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    verifyOtp(@Body(new ZodValidationPipe(SVerifyOtp)) dto: TVerifyOtp) {
        return this.verifyOtpUseCase.execute(dto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    signin(@Body(new ZodValidationPipe(SSignin)) dto: TSignin) {
        return this.signinUseCase.execute(dto);
    }
}
