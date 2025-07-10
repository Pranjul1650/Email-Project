import { supabase } from '../lib/supabase';
import { EmailMessage, EmailStatus } from '../types';

export class DatabaseEmailService {
  async sendEmail(message: EmailMessage): Promise<{ messageId: string; success: boolean }> {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: message.to,
          subject: message.subject,
          body: message.body,
          from: message.from
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return {
        messageId: result.messageId,
        success: result.success
      };
    } catch (error) {
      console.error('Send email error:', error);
      throw error;
    }
  }

  async getEmailStatus(messageId: string): Promise<any> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-email-status?messageId=${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get email status');
      }

      return await response.json();
    } catch (error) {
      console.error('Get email status error:', error);
      throw error;
    }
  }

  async getProviderHealth(): Promise<any> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-provider-health`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get provider health');
      }

      return await response.json();
    } catch (error) {
      console.error('Get provider health error:', error);
      throw error;
    }
  }

  async getAllEmails(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('email_messages')
        .select(`
          *,
          email_attempts (*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get all emails error:', error);
      throw error;
    }
  }
}