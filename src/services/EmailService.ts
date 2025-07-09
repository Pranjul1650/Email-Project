import { 
  EmailMessage, 
  EmailResult, 
  EmailStatus, 
  EmailProvider, 
  EmailServiceConfig,
  RateLimitInfo,
  CircuitBreakerState
} from '../types';
import { RateLimiter } from './RateLimiter';
import { CircuitBreaker } from './CircuitBreaker';
import { Logger } from './Logger';
import { generateId, delay, calculateExponentialBackoff, isValidEmail } from '../utils';

export class EmailService {
  private readonly providers: EmailProvider[];
  private readonly rateLimiter: RateLimiter;
  private readonly circuitBreakers: Map<string, CircuitBreaker>;
  private readonly logger: Logger;
  private readonly emailStatuses: Map<string, EmailStatus>;
  private readonly sentMessages: Set<string>; // For idempotency
  private readonly config: EmailServiceConfig;

  constructor(
    providers: EmailProvider[],
    config: Partial<EmailServiceConfig> = {}
  ) {
    if (!providers || providers.length === 0) {
      throw new Error('At least one email provider is required');
    }

    this.providers = providers;
    this.config = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      rateLimit: {
        requests: 100,
        windowMs: 60000
      },
      circuitBreaker: {
        failureThreshold: 5,
        timeout: 60000
      },
      ...config
    };

    this.rateLimiter = new RateLimiter(
      this.config.rateLimit.requests,
      this.config.rateLimit.windowMs
    );

    this.circuitBreakers = new Map();
    this.providers.forEach(provider => {
      this.circuitBreakers.set(
        provider.name,
        new CircuitBreaker(
          this.config.circuitBreaker.failureThreshold,
          this.config.circuitBreaker.timeout
        )
      );
    });

    this.logger = new Logger();
    this.emailStatuses = new Map();
    this.sentMessages = new Set();
  }

  async sendEmail(message: EmailMessage): Promise<EmailStatus> {
    // Generate unique message ID if not provided
    const messageId = message.id || generateId();
    
    // Check for idempotency
    if (this.sentMessages.has(messageId)) {
      this.logger.warn('Duplicate email attempt detected', { messageId });
      const existingStatus = this.emailStatuses.get(messageId);
      if (existingStatus) {
        return existingStatus;
      }
    }

    // Validate email format
    if (!isValidEmail(message.to)) {
      throw new Error('Invalid email address format');
    }

    // Check rate limit
    const canSend = await this.rateLimiter.consume();
    if (!canSend) {
      const rateLimitInfo = await this.rateLimiter.checkLimit();
      throw new Error(`Rate limit exceeded. Try again after ${rateLimitInfo.reset.toISOString()}`);
    }

    // Create email status
    const emailStatus: EmailStatus = {
      messageId,
      status: 'pending',
      attempts: [],
      createdAt: new Date(),
      originalMessage: { ...message, id: messageId }
    };

    this.emailStatuses.set(messageId, emailStatus);
    this.logger.info('Email send request received', { messageId, to: message.to });

    try {
      await this.attemptSendWithRetry(emailStatus);
      
      if (emailStatus.status === 'sent') {
        this.sentMessages.add(messageId);
      }
    } catch (error) {
      this.logger.error('Email send failed after all retries', { 
        messageId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      emailStatus.status = 'failed';
    }

    return emailStatus;
  }

  private async attemptSendWithRetry(emailStatus: EmailStatus): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        const result = await this.attemptSendWithProviders(emailStatus, attempt);
        
        if (result.success) {
          emailStatus.status = 'sent';
          emailStatus.sentAt = new Date();
          this.logger.info('Email sent successfully', { 
            messageId: emailStatus.messageId,
            provider: result.provider,
            attempt
          });
          return;
        }

        lastError = new Error(result.error || 'Send failed');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }

      // Don't retry on the last attempt
      if (attempt <= this.config.maxRetries) {
        emailStatus.status = 'retry';
        const delayMs = calculateExponentialBackoff(
          attempt,
          this.config.baseDelay,
          this.config.maxDelay
        );
        
        this.logger.warn('Email send attempt failed, retrying', {
          messageId: emailStatus.messageId,
          attempt,
          delayMs,
          error: lastError.message
        });

        await delay(delayMs);
      }
    }

    throw lastError || new Error('All send attempts failed');
  }

  private async attemptSendWithProviders(
    emailStatus: EmailStatus, 
    attemptNumber: number
  ): Promise<EmailResult> {
    let lastError: Error | null = null;

    // Try each provider in order
    for (const provider of this.providers) {
      const circuitBreaker = this.circuitBreakers.get(provider.name)!;
      
      try {
        const result = await circuitBreaker.execute(async () => {
          return await provider.send(emailStatus.originalMessage);
        });

        result.attemptNumber = attemptNumber;
        emailStatus.attempts.push(result);

        if (result.success) {
          return result;
        }

        lastError = new Error(result.error || 'Provider returned failure');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Log circuit breaker state
        const breakerState = circuitBreaker.getState();
        this.logger.warn('Provider failed', {
          provider: provider.name,
          error: lastError.message,
          circuitBreakerState: breakerState.state,
          attemptNumber
        });

        // Record the failed attempt
        const failedResult: EmailResult = {
          success: false,
          error: lastError.message,
          provider: provider.name,
          timestamp: new Date(),
          attemptNumber
        };
        emailStatus.attempts.push(failedResult);
      }
    }

    throw lastError || new Error('All providers failed');
  }

  getEmailStatus(messageId: string): EmailStatus | undefined {
    return this.emailStatuses.get(messageId);
  }

  getAllEmailStatuses(): EmailStatus[] {
    return Array.from(this.emailStatuses.values());
  }

  async getRateLimitInfo(): Promise<RateLimitInfo> {
    return await this.rateLimiter.checkLimit();
  }

  getCircuitBreakerStates(): Map<string, CircuitBreakerState> {
    const states = new Map<string, CircuitBreakerState>();
    
    for (const [providerName, circuitBreaker] of this.circuitBreakers.entries()) {
      states.set(providerName, circuitBreaker.getState());
    }
    
    return states;
  }

  getRecentLogs(count: number = 50) {
    return this.logger.getRecentLogs(count);
  }

  resetCircuitBreakers(): void {
    this.circuitBreakers.forEach(cb => cb.reset());
    this.logger.info('All circuit breakers reset');
  }

  resetRateLimit(): void {
    this.rateLimiter.reset();
    this.logger.info('Rate limit reset');
  }

  // Cleanup method to remove old statuses and logs
  cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - olderThanMs);
    
    for (const [messageId, status] of this.emailStatuses.entries()) {
      if (status.createdAt < cutoff) {
        this.emailStatuses.delete(messageId);
        this.sentMessages.delete(messageId);
      }
    }

    this.rateLimiter.cleanup();
    this.logger.info('Service cleanup completed');
  }
}