export interface IOtpSendRequestedEvent {
  email: string;
  code: string;
  expiresInMinutes: number;
}
