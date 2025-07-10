/*
  # Email Service Database Schema

  1. New Tables
    - `email_messages`
      - `id` (uuid, primary key)
      - `to_email` (text, not null)
      - `from_email` (text)
      - `subject` (text, not null)
      - `body` (text, not null)
      - `status` (text, not null, default 'pending')
      - `created_at` (timestamp, default now())
      - `sent_at` (timestamp, nullable)
      - `retry_count` (integer, default 0)
      - `last_error` (text, nullable)

    - `email_attempts`
      - `id` (uuid, primary key)
      - `message_id` (uuid, foreign key to email_messages)
      - `provider_name` (text, not null)
      - `attempt_number` (integer, not null)
      - `success` (boolean, not null)
      - `error_message` (text, nullable)
      - `attempted_at` (timestamp, default now())

    - `provider_health`
      - `id` (uuid, primary key)
      - `provider_name` (text, unique, not null)
      - `circuit_breaker_state` (text, default 'closed')
      - `failure_count` (integer, default 0)
      - `last_failure_at` (timestamp, nullable)
      - `next_attempt_at` (timestamp, nullable)
      - `updated_at` (timestamp, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Email Messages Table
CREATE TABLE IF NOT EXISTS email_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  from_email text DEFAULT 'noreply@example.com',
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry')),
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  retry_count integer DEFAULT 0,
  last_error text,
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Email Attempts Table
CREATE TABLE IF NOT EXISTS email_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES email_messages(id) ON DELETE CASCADE,
  provider_name text NOT NULL,
  attempt_number integer NOT NULL,
  success boolean NOT NULL,
  error_message text,
  attempted_at timestamptz DEFAULT now()
);

-- Provider Health Table
CREATE TABLE IF NOT EXISTS provider_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text UNIQUE NOT NULL,
  circuit_breaker_state text DEFAULT 'closed' CHECK (circuit_breaker_state IN ('closed', 'open', 'half-open')),
  failure_count integer DEFAULT 0,
  last_failure_at timestamptz,
  next_attempt_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_health ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_messages
CREATE POLICY "Users can read own email messages"
  ON email_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email messages"
  ON email_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email messages"
  ON email_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for email_attempts
CREATE POLICY "Users can read email attempts for their messages"
  ON email_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM email_messages 
      WHERE email_messages.id = email_attempts.message_id 
      AND email_messages.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert email attempts"
  ON email_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for provider_health (read-only for users)
CREATE POLICY "Users can read provider health"
  ON provider_health
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service can manage provider health"
  ON provider_health
  FOR ALL
  TO authenticated
  USING (true);

-- Insert initial provider health records
INSERT INTO provider_health (provider_name) VALUES 
  ('Provider A'),
  ('Provider B'),
  ('Provider C')
ON CONFLICT (provider_name) DO NOTHING;