import { CircuitBreakerState } from '../types';

export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailure?: Date;
  private nextAttempt?: Date;

  constructor(
    private readonly failureThreshold: number,
    private readonly timeout: number
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.nextAttempt && new Date() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailure = undefined;
    this.nextAttempt = undefined;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailure = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = new Date(Date.now() + this.timeout);
    }
  }

  getState(): CircuitBreakerState {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailure: this.lastFailure,
      nextAttempt: this.nextAttempt
    };
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailure = undefined;
    this.nextAttempt = undefined;
  }
}