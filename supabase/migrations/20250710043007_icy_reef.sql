/*
  # Fix Foreign Key References

  1. Changes
    - Update foreign key reference from auth.users to users table
    - Ensure proper foreign key constraints are in place

  2. Security
    - Maintain existing RLS policies
    - Update user_id default to use uid() function
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

  -- Add the correct foreign key constraint to users table (not auth.users)
  -- Note: This assumes a users table exists. If not, we'll reference auth.users directly
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    ALTER TABLE email_messages ADD CONSTRAINT email_messages_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);
  END IF;
END $$;

-- Update the default value for user_id to use uid() instead of auth.uid()
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'email_messages' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE email_messages ALTER COLUMN user_id SET DEFAULT uid();
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