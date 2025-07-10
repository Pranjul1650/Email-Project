# Resilient Email Service API Documentation

## Overview
This API provides a resilient email sending service with retry logic, fallback mechanisms, circuit breakers, and comprehensive monitoring. Built with Supabase Edge Functions and PostgreSQL database.

## Base URL
```
https://your-project.supabase.co/functions/v1
```

## Authentication
All requests require the Supabase API key in the Authorization header:
```
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

## Endpoints

### 1. Send Email
**POST** `/send-email`

Sends an email with automatic retry logic and provider fallback.

#### Request Body
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email content here",
  "from": "sender@example.com" // optional, defaults to noreply@example.com
}
```

#### Response
```json
{
  "success": true,
  "messageId": "uuid-here",
  "status": "sent",
  "attempts": 1,
  "message": "Email sent successfully"
}
```

#### Error Response
```json
{
  "success": false,
  "messageId": "uuid-here",
  "status": "failed",
  "attempts": 3,
  "message": "Failed to send email: All providers failed"
}
```

### 2. Get Email Status
**GET** `/get-email-status?messageId={uuid}`

Retrieves the status and attempt history of a specific email.

#### Parameters
- `messageId` (required): UUID of the email message

#### Response
```json
{
  "messageId": "uuid-here",
  "status": "sent",
  "to": "recipient@example.com",
  "from": "sender@example.com",
  "subject": "Email Subject",
  "createdAt": "2024-01-01T12:00:00Z",
  "sentAt": "2024-01-01T12:00:05Z",
  "retryCount": 1,
  "lastError": null,
  "attempts": [
    {
      "id": "attempt-uuid",
      "provider_name": "Provider A",
      "attempt_number": 1,
      "success": true,
      "error_message": null,
      "attempted_at": "2024-01-01T12:00:05Z"
    }
  ]
}
```

### 3. Get Provider Health
**GET** `/get-provider-health`

Returns the health status of all email providers and system statistics.

#### Response
```json
{
  "providerHealth": [
    {
      "id": "uuid",
      "provider_name": "Provider A",
      "circuit_breaker_state": "closed",
      "failure_count": 0,
      "last_failure_at": null,
      "next_attempt_at": null,
      "updated_at": "2024-01-01T12:00:00Z"
    }
  ],
  "emailStats": {
    "total": 100,
    "sent": 85,
    "failed": 10,
    "pending": 3,
    "retry": 2
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Features

### Retry Logic
- Exponential backoff with jitter
- Maximum 3 retry attempts
- Configurable delays (1s base, 30s max)

### Circuit Breaker
- Opens after 5 consecutive failures
- 60-second timeout before half-open state
- Automatic recovery on success

### Provider Fallback
- 3 mock email providers with different success rates
- Automatic failover to next provider
- Provider health tracking

### Rate Limiting
- Built into Supabase Edge Functions
- Configurable per-function limits

### Database Schema
- `email_messages`: Stores email data and status
- `email_attempts`: Tracks all sending attempts
- `provider_health`: Monitors circuit breaker states

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Missing required fields or invalid email format |
| 404 | Not Found - Email message not found |
| 500 | Internal Server Error - System error or all providers failed |

## Rate Limits
- Default: 100 requests per minute per IP
- Configurable via Supabase dashboard

## Monitoring
- Real-time provider health status
- Email delivery statistics
- Circuit breaker state monitoring
- Attempt history tracking

## Example Usage

### cURL Examples

#### Send Email
```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email",
    "from": "sender@example.com"
  }'
```

#### Get Email Status
```bash
curl -X GET "https://your-project.supabase.co/functions/v1/get-email-status?messageId=your-message-id" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

#### Get Provider Health
```bash
curl -X GET https://your-project.supabase.co/functions/v1/get-provider-health \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

### JavaScript Examples

```javascript
// Send Email
const response = await fetch('https://your-project.supabase.co/functions/v1/send-email', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test Email',
    body: 'This is a test email'
  })
});

const result = await response.json();
console.log(result);
```

## Database Tables

### email_messages
- Primary storage for email data
- Tracks status, retry count, and timestamps
- Row Level Security enabled

### email_attempts
- Detailed attempt history
- Links to email_messages via foreign key
- Tracks provider performance

### provider_health
- Circuit breaker state management
- Failure count tracking
- Automatic recovery timing

## Security
- Row Level Security (RLS) enabled on all tables
- User-based data isolation
- API key authentication required
- Input validation and sanitization

## Deployment
The API is deployed as Supabase Edge Functions and automatically scales based on demand.