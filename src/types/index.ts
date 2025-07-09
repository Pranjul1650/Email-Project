export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  from?: string;
  id?: string;
}

export interface EmailProvider {
  name: string;
  send(message: EmailMessage): Promise<EmailResult>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
  timestamp: Date;
  attemptNumber: number;
}

export interface EmailStatus {
  messageId: string;
  status: 'pending' | 'sent' | 'failed' | 'retry';
  attempts: EmailResult[];
  createdAt: Date;
  sentAt?: Date;
  originalMessage: EmailMessage;
}

export interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailure?: Date;
  nextAttempt?: Date;
}

export interface EmailServiceConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
  circuitBreaker: {
    failureThreshold: number;
    timeout: number;
  };
}