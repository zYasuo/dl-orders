import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardErrorResponseDto, ZodValidationPipe } from '@app/shared';
import { SigninDto, SSignin, type TSignin } from '../../../application/dto/signin.dto';
import { SignupDto, SSignup, type TSignup } from '../../../application/dto/signup.dto';
import { SVerifyOtp, type TVerifyOtp, VerifyOtpDto } from '../../../application/dto/verify-otp.dto';
import { SigninUseCase } from '../../../application/use-cases/signin.use-case';
import { SignupUseCase } from '../../../application/use-cases/signup.use-case';
import { VerifyOtpUseCase } from '../../../application/use-cases/verify-otp.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly signupUseCase: SignupUseCase,
        private readonly verifyOtpUseCase: VerifyOtpUseCase,
        private readonly signinUseCase: SigninUseCase,
    ) {}

    @Post('signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User signup' })
    @ApiBody({ type: SignupDto })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input', type: StandardErrorResponseDto })
    signup(@Body(new ZodValidationPipe(SSignup)) dto: TSignup) {
        return this.signupUseCase.execute(dto);
    }

    @Post('verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify OTP code' })
    @ApiBody({ type: VerifyOtpDto })
    @ApiResponse({ status: 200, description: 'OTP verified, returns accessToken' })
    @ApiResponse({ status: 400, description: 'Invalid or expired code', type: StandardErrorResponseDto })
    verifyOtp(@Body(new ZodValidationPipe(SVerifyOtp)) dto: TVerifyOtp) {
        return this.verifyOtpUseCase.execute(dto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign in' })
    @ApiBody({ type: SigninDto })
    @ApiResponse({ status: 200, description: 'Sign in successful, returns accessToken' })
    @ApiResponse({ status: 400, description: 'Invalid credentials', type: StandardErrorResponseDto })
    signin(@Body(new ZodValidationPipe(SSignin)) dto: TSignin) {
        return this.signinUseCase.execute(dto);
    }
}
