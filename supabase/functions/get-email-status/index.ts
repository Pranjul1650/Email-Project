import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const messageId = url.searchParams.get('messageId');

    if (!messageId) {
      return new Response(
        JSON.stringify({ error: 'messageId parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get email status with attempts
    const { data: emailStatus, error } = await supabaseClient
      .from('email_messages')
      .select(`
        *,
        email_attempts (*)
      `)
      .eq('id', messageId)
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Email not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        messageId: emailStatus.id,
        status: emailStatus.status,
        to: emailStatus.to_email,
        from: emailStatus.from_email,
        subject: emailStatus.subject,
        createdAt: emailStatus.created_at,
        sentAt: emailStatus.sent_at,
        retryCount: emailStatus.retry_count,
        lastError: emailStatus.last_error,
        attempts: emailStatus.email_attempts
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});