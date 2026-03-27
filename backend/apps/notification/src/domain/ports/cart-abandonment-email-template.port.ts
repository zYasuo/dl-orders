export abstract class CartAbandonmentEmailTemplatePort {
  abstract buildReminderEmail(input: { resumeUrl: string; summaryLines: string }): {
    subject: string;
    html: string;
  };
}
