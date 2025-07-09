import { EmailService } from '../services/EmailService';
import { MockEmailProvider } from '../services/providers/MockEmailProvider';
import { EmailMessage } from '../types';

// Mock delay function for faster tests
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  delay: jest.fn(() => Promise.resolve()),
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let mockProviders: MockEmailProvider[];

  beforeEach(() => {
    mockProviders = [
      new MockEmailProvider('Provider1', 0.8, 10),
      new MockEmailProvider('Provider2', 0.7, 15),
    ];
    
    emailService = new EmailService(mockProviders, {
      maxRetries: 2,
      baseDelay: 100,
      maxDelay: 1000,
      rateLimit: {
        requests: 10,
        windowMs: 60000,
      },
      circuitBreaker: {
        failureThreshold: 3,
        timeout: 5000,
      },
    });
  });

  describe('constructor', () => {
    it('should throw error if no providers are given', () => {
      expect(() => new EmailService([])).toThrow('At least one email provider is required');
    });

    it('should initialize with providers', () => {
      expect(emailService).toBeDefined();
      expect(emailService.getCircuitBreakerStates().size).toBe(2);
    });
  });

  describe('sendEmail', () => {
    const testMessage: EmailMessage = {
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
      from: 'sender@example.com',
    };

    it('should send email successfully', async () => {
      const result = await emailService.sendEmail(testMessage);
      
      expect(result).toBeDefined();
      expect(result.messageId).toBeDefined();
      expect(result.originalMessage.to).toBe(testMessage.to);
      expect(['sent', 'failed', 'retry']).toContain(result.status);
    });

    it('should reject invalid email addresses', async () => {
      const invalidMessage = { ...testMessage, to: 'invalid-email' };
      
      await expect(emailService.sendEmail(invalidMessage)).rejects.toThrow('Invalid email address format');
    });

    it('should handle idempotency', async () => {
      const messageWithId = { ...testMessage, id: 'test-id-123' };
      
      const result1 = await emailService.sendEmail(messageWithId);
      const result2 = await emailService.sendEmail(messageWithId);
      
      expect(result1.messageId).toBe(result2.messageId);
    });

    it('should track email status', async () => {
      const result = await emailService.sendEmail(testMessage);
      const status = emailService.getEmailStatus(result.messageId);
      
      expect(status).toBeDefined();
      expect(status?.messageId).toBe(result.messageId);
      expect(status?.originalMessage.to).toBe(testMessage.to);
    });
  });

  describe('rate limiting', () => {
    it('should enforce rate limits', async () => {
      const testMessage: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      // Send messages up to the limit
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(emailService.sendEmail({ ...testMessage, id: `test-${i}` }));
      }
      
      await Promise.all(promises);

      // Next message should fail due to rate limit
      await expect(emailService.sendEmail({ ...testMessage, id: 'test-11' }))
        .rejects.toThrow('Rate limit exceeded');
    });

    it('should provide rate limit info', async () => {
      const rateLimitInfo = await emailService.getRateLimitInfo();
      
      expect(rateLimitInfo).toBeDefined();
      expect(rateLimitInfo.limit).toBe(10);
      expect(rateLimitInfo.remaining).toBeLessThanOrEqual(10);
      expect(rateLimitInfo.reset).toBeInstanceOf(Date);
    });
  });

  describe('circuit breaker', () => {
    it('should return circuit breaker states', () => {
      const states = emailService.getCircuitBreakerStates();
      
      expect(states.size).toBe(2);
      expect(states.has('Provider1')).toBe(true);
      expect(states.has('Provider2')).toBe(true);
      
      const provider1State = states.get('Provider1');
      expect(provider1State?.state).toBe('closed');
      expect(provider1State?.failureCount).toBe(0);
    });

    it('should reset circuit breakers', () => {
      emailService.resetCircuitBreakers();
      
      const states = emailService.getCircuitBreakerStates();
      states.forEach(state => {
        expect(state.state).toBe('closed');
        expect(state.failureCount).toBe(0);
      });
    });
  });

  describe('logging', () => {
    it('should provide recent logs', async () => {
      const testMessage: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      await emailService.sendEmail(testMessage);
      
      const logs = emailService.getRecentLogs(10);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toHaveProperty('timestamp');
      expect(logs[0]).toHaveProperty('level');
      expect(logs[0]).toHaveProperty('message');
    });
  });

  describe('cleanup', () => {
    it('should clean up old data', async () => {
      const testMessage: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      await emailService.sendEmail(testMessage);
      
      const statusesBefore = emailService.getAllEmailStatuses();
      expect(statusesBefore.length).toBe(1);
      
      // Cleanup with 0ms threshold should remove all data
      emailService.cleanup(0);
      
      const statusesAfter = emailService.getAllEmailStatuses();
      expect(statusesAfter.length).toBe(0);
    });
  });

  describe('service management', () => {
    it('should reset rate limit', async () => {
      const rateLimitInfoBefore = await emailService.getRateLimitInfo();
      
      emailService.resetRateLimit();
      
      const rateLimitInfoAfter = await emailService.getRateLimitInfo();
      expect(rateLimitInfoAfter.remaining).toBe(rateLimitInfoBefore.limit);
    });

    it('should get all email statuses', async () => {
      const testMessage: EmailMessage = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      await emailService.sendEmail(testMessage);
      await emailService.sendEmail({ ...testMessage, id: 'test-2' });
      
      const allStatuses = emailService.getAllEmailStatuses();
      expect(allStatuses.length).toBe(2);
    });
  });
});