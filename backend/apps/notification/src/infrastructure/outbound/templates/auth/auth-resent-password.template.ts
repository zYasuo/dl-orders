export const RESET_PASSWORD_TITLE = 'Solicited Reset your password';

export const resetPasswordHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solicited Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;">
                    <tr>
                        <td style="padding: 28px 24px 20px; background-color: #18181b; text-align: center;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em;">Reset your password</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1aa;">Account security request this link to expire in {{ expiresInMinutes }} minutes.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px;">
                            <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;">Click the button below to reset your password:</p>
                            <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;">{{ resetPasswordLink }}</p>
                            <p style="margin: 0 0 4px; font-size: 12px; color: #a1a1aa;">If you did not request this change, you can safely ignore this email.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 24px; background-color: #fafafa; border-top: 1px solid #e4e4e7; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">This is an automated message. Please do not reply.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

