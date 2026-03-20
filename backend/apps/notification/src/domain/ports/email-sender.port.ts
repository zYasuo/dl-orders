export abstract class EmailSenderPort {
  abstract send(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean; error?: string }>;
}
