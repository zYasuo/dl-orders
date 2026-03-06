export interface OtpSendRequestedEvent {
    email: string;
    code: string;
    expiresInMinutes: number;
}
