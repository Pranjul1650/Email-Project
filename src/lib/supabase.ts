import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('Please configure your Supabase environment variables in the .env file. Replace the placeholder values with your actual Supabase project URL and anon key.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      email_messages: {
        Row: {
          id: string;
          to_email: string;
          from_email: string | null;
          subject: string;
          body: string;
          status: 'pending' | 'sent' | 'failed' | 'retry';
          created_at: string;
          sent_at: string | null;
          retry_count: number;
          last_error: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          to_email: string;
          from_email?: string | null;
          subject: string;
          body: string;
          status?: 'pending' | 'sent' | 'failed' | 'retry';
          created_at?: string;
          sent_at?: string | null;
          retry_count?: number;
          last_error?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          to_email?: string;
          from_email?: string | null;
          subject?: string;
          body?: string;
          status?: 'pending' | 'sent' | 'failed' | 'retry';
          created_at?: string;
          sent_at?: string | null;
          retry_count?: number;
          last_error?: string | null;
          user_id?: string | null;
        };
      };
      email_attempts: {
        Row: {
          id: string;
          message_id: string;
          provider_name: string;
          attempt_number: number;
          success: boolean;
          error_message: string | null;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          provider_name: string;
          attempt_number: number;
          success: boolean;
          error_message?: string | null;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          provider_name?: string;
          attempt_number?: number;
          success?: boolean;
          error_message?: string | null;
          attempted_at?: string;
        };
      };
      provider_health: {
        Row: {
          id: string;
          provider_name: string;
          circuit_breaker_state: 'closed' | 'open' | 'half-open';
          failure_count: number;
          last_failure_at: string | null;
          next_attempt_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_name: string;
          circuit_breaker_state?: 'closed' | 'open' | 'half-open';
          failure_count?: number;
          last_failure_at?: string | null;
          next_attempt_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_name?: string;
          circuit_breaker_state?: 'closed' | 'open' | 'half-open';
          failure_count?: number;
          last_failure_at?: string | null;
          next_attempt_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};