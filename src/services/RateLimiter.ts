import { RateLimitInfo } from '../types';

interface RateLimitWindow {
  count: number;
  resetTime: Date;
}

export class RateLimiter {
  private windows: Map<string, RateLimitWindow> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  async checkLimit(key: string = 'default'): Promise<RateLimitInfo> {
    const now = new Date();
    let window = this.windows.get(key);

    if (!window || now >= window.resetTime) {
      window = {
        count: 0,
        resetTime: new Date(now.getTime() + this.windowMs)
      };
      this.windows.set(key, window);
    }

    const remaining = Math.max(0, this.limit - window.count);
    
    return {
      remaining,
      reset: window.resetTime,
      limit: this.limit
    };
  }

  async consume(key: string = 'default'): Promise<boolean> {
    const info = await this.checkLimit(key);
    
    if (info.remaining <= 0) {
      return false;
    }

    const window = this.windows.get(key)!;
    window.count++;
    
    return true;
  }

  reset(key: string = 'default'): void {
    this.windows.delete(key);
  }

  cleanup(): void {
    const now = new Date();
    for (const [key, window] of this.windows.entries()) {
      if (now >= window.resetTime) {
        this.windows.delete(key);
      }
    }
  }
}