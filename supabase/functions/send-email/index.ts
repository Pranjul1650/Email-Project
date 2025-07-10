import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

interface MockProvider {
  name: string;
  successRate: number;
  latency: number;
}

const providers: MockProvider[] = [
  { name: 'Provider A', successRate: 0.7, latency: 200 },
  { name: 'Provider B', successRate: 0.8, latency: 300 },
  { name: 'Provider C', successRate: 0.6, latency: 150 },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockSendEmail = async (provider: MockProvider): Promise<{ success: boolean; error?: string }> => {
  await delay(provider.latency + Math.random() * 50);
  
  const success = Math.random() < provider.successRate;
  
  if (!success) {
    const errors = [
      'Network timeout',
      'Invalid recipient',
      'Rate limit exceeded',
      'Service temporarily unavailable',
      'Authentication failed'
    ];
    return { success: false, error: errors[Math.floor(Math.random() * errors.length)] };
  }
  
  return { success: true };
};

const calculateExponentialBackoff = (attempt: number, baseDelay: number = 1000, maxDelay: number = 30000): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, maxDelay);
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

    const { to, subject, body, from = 'noreply@example.com' }: EmailRequest = await req.json();

    // Validate input
    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create email message record
    const { data: emailMessage, error: insertError } = await supabaseClient
      .from('email_messages')
      .insert({
        to_email: to,
        from_email: from,
        subject,
        body,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create email record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get provider health states
    const { data: providerHealthData } = await supabaseClient
      .from('provider_health')
      .select('*');

    const providerHealthMap = new Map(
      providerHealthData?.map(p => [p.provider_name, p]) || []
    );

    let emailSent = false;
    let lastError = '';
    const maxRetries = 3;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= maxRetries && !emailSent; attempt++) {
      // Try each provider
      for (const provider of providers) {
        const health = providerHealthMap.get(provider.name);
        
        // Skip if circuit breaker is open
        if (health?.circuit_breaker_state === 'open' && 
            health.next_attempt_at && 
            new Date() < new Date(health.next_attempt_at)) {
          continue;
        }

        try {
          const result = await mockSendEmail(provider);
          
          // Record attempt
          await supabaseClient
            .from('email_attempts')
            .insert({
              message_id: emailMessage.id,
              provider_name: provider.name,
              attempt_number: attempt,
              success: result.success,
              error_message: result.error || null
            });

          if (result.success) {
            // Update email status to sent
            await supabaseClient
              .from('email_messages')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', emailMessage.id);

            // Reset provider health on success
            await supabaseClient
              .from('provider_health')
              .upsert({
                provider_name: provider.name,
                circuit_breaker_state: 'closed',
                failure_count: 0,
                last_failure_at: null,
                next_attempt_at: null,
                updated_at: new Date().toISOString()
              });

            emailSent = true;
            break;
          } else {
            lastError = result.error || 'Unknown error';
            
            // Update provider health on failure
            const currentFailures = (health?.failure_count || 0) + 1;
            const shouldOpenCircuit = currentFailures >= 5;
            
            await supabaseClient
              .from('provider_health')
              .upsert({
                provider_name: provider.name,
                circuit_breaker_state: shouldOpenCircuit ? 'open' : 'closed',
                failure_count: currentFailures,
                last_failure_at: new Date().toISOString(),
                next_attempt_at: shouldOpenCircuit ? 
                  new Date(Date.now() + 60000).toISOString() : null,
                updated_at: new Date().toISOString()
              });
          }
        } catch (error) {
          console.error(`Provider ${provider.name} error:`, error);
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // If not sent and not the last attempt, wait before retrying
      if (!emailSent && attempt < maxRetries) {
        const delayMs = calculateExponentialBackoff(attempt);
        await delay(delayMs);
        
        // Update retry count
        await supabaseClient
          .from('email_messages')
          .update({
            retry_count: attempt,
            status: 'retry'
          })
          .eq('id', emailMessage.id);
      }
    }

    // Final status update
    if (!emailSent) {
      await supabaseClient
        .from('email_messages')
        .update({
          status: 'failed',
          last_error: lastError
        })
        .eq('id', emailMessage.id);
    }

    // Get final email status with attempts
    const { data: finalStatus } = await supabaseClient
      .from('email_messages')
      .select(`
        *,
        email_attempts (*)
      `)
      .eq('id', emailMessage.id)
      .single();

    return new Response(
      JSON.stringify({
        success: emailSent,
        messageId: emailMessage.id,
        status: finalStatus?.status,
        attempts: finalStatus?.email_attempts?.length || 0,
        message: emailSent ? 'Email sent successfully' : `Failed to send email: ${lastError}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: emailSent ? 200 : 500
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