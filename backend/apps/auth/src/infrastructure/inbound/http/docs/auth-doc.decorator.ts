import { applyDecorators, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardErrorResponseDto } from '@app/shared';
import { SignupDto } from '../../../../application/dto/signup.dto';
import { SigninDto } from '../../../../application/dto/signin.dto';
import { VerifyOtpDto } from '../../../../application/dto/verify-otp.dto';
import { ChangePasswordDto } from '../../../../application/dto/change-password.dto';
import { RateLimitEndpoint } from '../decorators/rate-limit-endpoint.decorator';
import { CreateResetPasswordLinkDto } from 'apps/auth/src/application/dto/create-reset-password-link.dto';

export const ApiAuth = () => applyDecorators(ApiTags('Auth'));

const standardError = (status: number, description: string) => ApiResponse({ status, description, type: StandardErrorResponseDto });

export const AuthDoc = {
    Signup: () =>
        applyDecorators(
            Post('signup'),
            HttpCode(HttpStatus.CREATED),
            RateLimitEndpoint('signup'),
            ApiOperation({ summary: 'User signup' }),
            ApiBody({ type: SignupDto }),
            ApiResponse({ status: 201, description: 'User created successfully' }),
            standardError(400, 'Invalid input'),
            standardError(429, 'Too many requests'),
        ),

    VerifyOtp: () =>
        applyDecorators(
            Post('verify-otp'),
            HttpCode(HttpStatus.OK),
            RateLimitEndpoint('verify-otp'),
            ApiOperation({ summary: 'Verify OTP code' }),
            ApiBody({ type: VerifyOtpDto }),
            ApiResponse({ status: 200, description: 'OTP verified, returns accessToken' }),
            standardError(400, 'Invalid or expired code'),
            standardError(429, 'Too many requests'),
        ),

    Signin: () =>
        applyDecorators(
            Post('signin'),
            HttpCode(HttpStatus.OK),
            RateLimitEndpoint('signin'),
            ApiOperation({ summary: 'Sign in' }),
            ApiBody({ type: SigninDto }),
            ApiResponse({ status: 200, description: 'Sign in successful, returns accessToken' }),
            standardError(400, 'Invalid credentials'),
            ApiResponse({ status: 403, description: 'Account temporarily locked', type: StandardErrorResponseDto }),
            standardError(429, 'Too many requests'),
        ),

    CreateResetPasswordLink: () =>
        applyDecorators(
            Post('reset-password-link'),
            HttpCode(HttpStatus.OK),
            RateLimitEndpoint('reset-password-link'),
            ApiOperation({ summary: 'Request reset password link' }),
            ApiBody({ type: CreateResetPasswordLinkDto }),
            ApiResponse({ status: 200, description: 'If email is registered, a reset link will be sent' }),
            standardError(400, 'Invalid input'),
            standardError(429, 'Too many requests'),
        ),

    ChangePassword: () =>
        applyDecorators(
            Patch('change-password'),
            HttpCode(HttpStatus.OK),
            RateLimitEndpoint('change-password'),
            ApiOperation({ summary: 'Change password with reset token' }),
            ApiBody({ type: ChangePasswordDto }),
            ApiResponse({ status: 200, description: 'Password changed successfully' }),
            standardError(400, 'Token already used or expired'),
            standardError(404, 'User not found'),
            standardError(429, 'Too many requests'),
        ),
};
