# Resilient Email Service

A production-ready email sending service built with TypeScript that implements retry logic, fallback mechanisms, circuit breakers, rate limiting, and idempotency to ensure reliable email delivery.

## 🚀 Features

### Core Features
- **Retry Logic**: Exponential backoff with configurable attempts
- **Fallback Mechanism**: Automatic provider switching on failure
- **Idempotency**: Prevents duplicate email sends
- **Rate Limiting**: Configurable request limits with time windows
- **Status Tracking**: Real-time monitoring of email sending attempts

### Advanced Features
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Comprehensive Logging**: Structured logging with multiple levels
- **Basic Queue System**: In-memory queue for email processing
- **Provider Health Monitoring**: Real-time circuit breaker status
- **Clean Architecture**: SOLID principles with TypeScript

## 🏗️ Architecture

```
src/
├── services/
│   ├── EmailService.ts          # Main service orchestrator
│   ├── RateLimiter.ts          # Rate limiting implementation
│   ├── CircuitBreaker.ts       # Circuit breaker pattern
│   ├── Logger.ts               # Structured logging
│   └── providers/
│       ├── EmailProvider.ts     # Provider interface
│       ├── MockEmailProvider.ts # Mock implementation
│       └── index.ts
├── types/
│   └── index.ts                # TypeScript interfaces
├── utils/
│   └── index.ts                # Utility functions
├── components/
│   └── EmailDemo.tsx           # React demo interface
└── tests/
    └── EmailService.test.ts    # Unit tests
```

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd resilient-email-service

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🔧 Configuration

The EmailService accepts a configuration object with the following options:

```typescript
interface EmailServiceConfig {
  maxRetries: number;           // Maximum retry attempts (default: 3)
  baseDelay: number;           // Base delay for exponential backoff (default: 1000ms)
  maxDelay: number;            // Maximum delay between retries (default: 30000ms)
  rateLimit: {
    requests: number;          // Requests per window (default: 100)
    windowMs: number;          // Time window in milliseconds (default: 60000)
  };
  circuitBreaker: {
    failureThreshold: number;  // Failures before opening circuit (default: 5)
    timeout: number;           // Circuit breaker timeout (default: 60000ms)
  };
}
```

## 🚦 Usage

### Basic Usage

```typescript
import { EmailService } from './services/EmailService';
import { MockEmailProvider } from './services/providers/MockEmailProvider';

// Initialize providers
const providers = [
  new MockEmailProvider('Provider A', 0.8, 200),
  new MockEmailProvider('Provider B', 0.7, 300)
];

// Create service instance
const emailService = new EmailService(providers, {
  maxRetries: 3,
  baseDelay: 1000,
  rateLimit: {
    requests: 100,
    windowMs: 60000
  }
});

// Send email
const message = {
  to: 'user@example.com',
  subject: 'Welcome!',
  body: 'Thank you for signing up.',
  from: 'noreply@example.com'
};

const status = await emailService.sendEmail(message);
console.log('Email status:', status);
```

### Advanced Usage

```typescript
// Monitor service health
const rateLimitInfo = await emailService.getRateLimitInfo();
const circuitBreakerStates = emailService.getCircuitBreakerStates();
const recentLogs = emailService.getRecentLogs(50);

// Get email status
const emailStatus = emailService.getEmailStatus(messageId);

// Reset circuit breakers
emailService.resetCircuitBreakers();

// Cleanup old data
emailService.cleanup(24 * 60 * 60 * 1000); // 24 hours
```

## 🎯 Key Design Decisions

### 1. **Retry Logic with Exponential Backoff**
- Implements exponential backoff with jitter to prevent thundering herd problems
- Configurable base delay and maximum delay
- Stops retrying after configured maximum attempts

### 2. **Provider Fallback Strategy**
- Tries each provider in sequence until one succeeds
- Circuit breaker prevents repeated attempts to failing providers
- Maintains provider health state for monitoring

### 3. **Idempotency Implementation**
- Uses message IDs to track sent emails
- Prevents duplicate sends of the same message
- Maintains sent message registry with cleanup

### 4. **Rate Limiting**
- Sliding window rate limiting
- Per-service rate limits (can be extended to per-user)
- Configurable request limits and time windows

### 5. **Circuit Breaker Pattern**
- Prevents cascading failures
- Three states: Closed, Open, Half-Open
- Configurable failure threshold and timeout

## 🧪 Testing

The service includes comprehensive unit tests covering:

- Email sending functionality
- Retry logic and exponential backoff
- Circuit breaker behavior
- Rate limiting enforcement
- Idempotency guarantees
- Provider fallback mechanisms
- Error handling and edge cases

Run tests with:
```bash
npm test
```

## 🔍 Monitoring

The service provides built-in monitoring capabilities:

### Real-time Metrics
- Rate limit status and remaining requests
- Circuit breaker states for each provider
- Email sending statistics
- Recent logs with filtering

### Health Checks
- Provider availability status
- Circuit breaker health
- Rate limit consumption
- System performance metrics

## 🚀 Production Considerations

### Performance
- In-memory storage for development/testing
- Consider Redis for production rate limiting and caching
- Implement persistent storage for email status tracking

### Scalability
- Horizontal scaling with shared state management
- Database integration for email status persistence
- Message queue integration for high-volume processing

### Security
- Input validation and sanitization
- Rate limiting per user/IP
- Secure provider configuration management
- Audit logging for compliance

### Reliability
- Health checks for provider endpoints
- Graceful degradation on provider failures
- Dead letter queue for failed messages
- Monitoring and alerting integration

## 📊 Assumptions

1. **Mock Providers**: Uses mock email providers for demonstration
2. **In-Memory Storage**: All data stored in memory (not persistent)
3. **Single Instance**: Designed for single-instance deployment
4. **Development Environment**: Optimized for development and testing

## 🔮 Future Enhancements

- **Real Email Providers**: Integration with SendGrid, AWS SES, etc.
- **Persistent Storage**: Database integration for email status
- **Message Queue**: Redis/RabbitMQ for high-volume processing
- **Webhooks**: Status callbacks for email delivery events
- **Template Engine**: HTML email templates with variables
- **Batch Processing**: Bulk email sending capabilities
- **Analytics**: Email delivery analytics and reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- React for the demo interface
- Tailwind CSS for styling
- Jest for testing
- Lucide React for icons