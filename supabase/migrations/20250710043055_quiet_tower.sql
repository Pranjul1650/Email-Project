/*
  # Fix Foreign Key References and User Authentication

  1. Database Changes
    - Fix foreign key constraints between tables
    - Update user_id default to use correct auth function
    - Ensure proper relationships exist

  2. Security
    - Maintain RLS policies
    - Use correct Supabase auth functions
*/

-- First, let's update the email_messages table to use the correct user reference
DO $$
BEGIN
  -- Drop the existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'email_messages_user_id_fkey' 
    AND table_name = 'email_messages'
  ) THEN
    ALTER TABLE email_messages DROP CONSTRAINT email_messages_user_id_fkey;
  END IF;

  -- Add the correct foreign key constraint to auth.users
  ALTER TABLE email_messages ADD CONSTRAINT email_messages_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);
END $$;

-- Update the default value for user_id to use auth.uid() instead of uid()
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_messages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE email_messages ALTER COLUMN user_id SET DEFAULT auth.uid();
  END IF;
END $$;

-- Ensure the foreign key between email_attempts and email_messages exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'email_attempts_message_id_fkey' 
    AND table_name = 'email_attempts'
  ) THEN
    ALTER TABLE email_attempts ADD CONSTRAINT email_attempts_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES email_messages(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update RLS policies to use correct auth function
DROP POLICY IF EXISTS "Users can insert own email messages" ON email_messages;
DROP POLICY IF EXISTS "Users can read own email messages" ON email_messages;
DROP POLICY IF EXISTS "Users can update own email messages" ON email_messages;

CREATE POLICY "Users can insert own email messages"
  ON email_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own email messages"
  ON email_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email messages"
  ON email_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update email_attempts RLS policy
DROP POLICY IF EXISTS "Users can read email attempts for their messages" ON email_attempts;

CREATE POLICY "Users can read email attempts for their messages"
  ON email_attempts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM email_messages
      WHERE email_messages.id = email_attempts.message_id 
      AND email_messages.user_id = auth.uid()
    )
  );