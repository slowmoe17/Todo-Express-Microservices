import { EmailContext } from '../types/email.types';

export interface EmailStrategy {
  send(context: EmailContext): Promise<void>;
  getSubject(context: EmailContext): string;
  getHtmlContent(context: EmailContext): string;
}



