import { EmailProvider } from './EmailProvider';
import { EmailMessage, EmailResult } from '../../types';
import { generateId, delay } from '../../utils';

export class MockEmailProvider implements EmailProvider {
  constructor(
    public readonly name: string,
    private readonly successRate: number = 0.8,
    private readonly latency: number = 100
  ) {}

  async send(message: EmailMessage): Promise<EmailResult> {
    // Simulate network latency
    await delay(this.latency + Math.random() * 50);

    // Simulate random failures based on success rate
    const success = Math.random() < this.successRate;

    const result: EmailResult = {
      success,
      provider: this.name,
      timestamp: new Date(),
      attemptNumber: 1
    };

    if (success) {
      result.messageId = generateId();
    } else {
      result.error = this.getRandomError();
    }

    return result;
  }

  private getRandomError(): string {
    const errors = [
      'Network timeout',
      'Invalid recipient',
      'Rate limit exceeded',
      'Service temporarily unavailable',
      'Authentication failed',
      'Invalid email format'
    ];
    
    return errors[Math.floor(Math.random() * errors.length)];
  }
}