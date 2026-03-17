export const OTP_VERIFICATION_TITLE = 'Confirm your email - OTP code';

export const otpVerificationHtmlTemplate = `
    <p>Your verification code is: <strong>{{ code }}</strong>. Valid for {{ expiresInMinutes }} minutes.</p>
`;
