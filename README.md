# Resilient Email Service

A production-ready email sending service built with TypeScript, React, and Supabase that implements retry logic, fallback mechanisms, circuit breakers, and comprehensive monitoring to ensure reliable email delivery.

## 🚀 Live Demo

[View Live Application](https://your-deployment-url.vercel.app)

## 🏗️ Architecture

This service provides a complete email delivery solution with:

### Core Features
- **Database-Powered**: Uses Supabase PostgreSQL for persistent storage
- **API Endpoints**: RESTful API with Supabase Edge Functions
- **Retry Logic**: Exponential backoff with configurable attempts
- **Fallback Mechanism**: Automatic provider switching on failure
- **Circuit Breaker Pattern**: Prevents cascading failures
- **Real-time Monitoring**: Live provider health and email status tracking

### Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL with Row Level Security
- **Deployment**: Vercel/Netlify compatible

## 📦 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Pranjul1650/Email.git
cd Email
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
The database schema is automatically managed through Supabase migrations in the `supabase/migrations/` directory.

### 5. Start Development Server
```bash
npm run dev
```

## 🗄️ Database Schema

### Tables

#### `email_messages`
- Stores email data and delivery status
- Tracks retry attempts and timestamps
- Row Level Security enabled

#### `email_attempts`
- Detailed attempt history for each email
- Links to email_messages via foreign key
- Tracks provider performance

#### `provider_health`
- Circuit breaker state management
- Failure count tracking
- Automatic recovery timing

## 🔧 API Endpoints

### Send Email
```http
POST /functions/v1/send-email
Content-Type: application/json
Authorization: Bearer YOUR_SUPABASE_ANON_KEY

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "body": "Email content",
  "from": "sender@example.com"
}
```

### Get Email Status
```http
GET /functions/v1/get-email-status?messageId=uuid
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

### Get Provider Health
```http
GET /functions/v1/get-provider-health
Authorization: Bearer YOUR_SUPABASE_ANON_KEY
```

## 🎯 Key Features

### 1. **Resilient Email Delivery**
- Multiple provider fallback
- Exponential backoff retry logic
- Circuit breaker pattern implementation
- Automatic failure recovery

### 2. **Real-time Monitoring**
- Provider health dashboard
- Email delivery statistics
- Circuit breaker state tracking
- Attempt history visualization

### 3. **Production Ready**
- Row Level Security (RLS)
- Input validation and sanitization
- Comprehensive error handling
- Structured logging

### 4. **Developer Experience**
- TypeScript for type safety
- Comprehensive API documentation
- Unit tests included
- Clean architecture with SOLID principles

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables for Production
Set these in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Email sending functionality
- Retry logic and exponential backoff
- Circuit breaker behavior
- Rate limiting enforcement
- Provider fallback mechanisms

## 📊 Monitoring

The application provides built-in monitoring:

- **Email Statistics**: Success/failure rates, delivery times
- **Provider Health**: Circuit breaker states, failure counts
- **Real-time Updates**: Live status updates every 5 seconds
- **Historical Data**: Complete attempt history for each email

## 🔒 Security

- Row Level Security (RLS) on all database tables
- API key authentication required
- Input validation and sanitization
- User-based data isolation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com) for backend infrastructure
- UI components styled with [Tailwind CSS](https://tailwindcss.com)
- Icons provided by [Lucide React](https://lucide.dev)

## 📞 Support

For support, email pranjul1650@example.com or create an issue in this repository.