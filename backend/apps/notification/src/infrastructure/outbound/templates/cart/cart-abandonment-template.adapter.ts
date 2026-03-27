import { Injectable } from '@nestjs/common';
import { CartAbandonmentEmailTemplatePort } from '../../../../domain/ports/cart-abandonment-email-template.port';

@Injectable()
export class CartAbandonmentTemplateAdapter extends CartAbandonmentEmailTemplatePort {
  buildReminderEmail(input: { resumeUrl: string; summaryLines: string }): { subject: string; html: string } {
    const subject = 'Items left in your cart — dl-orders';
    const safeSummary = input.summaryLines.slice(0, 1500).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<p>Hello,</p>
<p>You added items to your cart and haven’t checked out yet. When you’re ready, continue here:</p>
<p><a href="${input.resumeUrl}">Return to cart</a></p>
<p>Summary: ${safeSummary}</p>
<p>If you already completed your purchase, you can ignore this email.</p>
<p>— dl-orders</p>`;
    return { subject, html };
  }
}
