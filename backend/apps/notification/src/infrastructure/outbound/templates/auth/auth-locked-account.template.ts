export const ACCOUNT_LOCKED_TITLE = 'Account temporarily locked - Login attempts';

export const accountLockedHtmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account temporarily locked</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); overflow: hidden;">
                    <tr>
                        <td style="padding: 28px 24px 20px; background-color: #18181b; text-align: center;">
                            <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; letter-spacing: -0.02em;">Account temporarily locked</h1>
                            <p style="margin: 8px 0 0; font-size: 14px; color: #a1a1aa;">Multiple failed login attempts detected.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px;">
                            <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;">Your account has been temporarily locked due to multiple failed login attempts.</p>
                            <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46;"><strong>What you need to do:</strong></p>
                            <ul style="margin: 0 0 16px; padding-left: 20px; font-size: 15px; color: #3f3f46;">
                                <li>Wait <strong>{{ lockedUntilMinutes }} minutes</strong> before trying again.</li>
                                <li>Verify you are using the correct password.</li>
                                <li>If you forgot your password, use the password recovery option when available.</li>
                            </ul>
                            <p style="margin: 0; font-size: 15px; color: #3f3f46;">If you did not attempt to access your account, we recommend changing your password once the lock is lifted.</p>
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
