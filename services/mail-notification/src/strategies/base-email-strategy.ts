import { EmailStrategy } from './email-strategy.interface';
import { EmailContext } from '../types/email.types';
import { emailService } from '../services/email.service';

export abstract class BaseEmailStrategy implements EmailStrategy {
  abstract getSubject(context: EmailContext): string;
  abstract getHtmlContent(context: EmailContext): string;

  async send(context: EmailContext): Promise<void> {
    if (!context.userEmail) {
      console.warn(`No email address found for user ${context.userId}`);
      return;
    }

    const emailData = {
      to: context.userEmail,
      subject: this.getSubject(context),
      html: this.getHtmlContent(context),
    };

    await emailService.sendEmail(emailData);
  }
}



