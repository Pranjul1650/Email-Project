import { EmailMessage, EmailResult } from '../../types';

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}