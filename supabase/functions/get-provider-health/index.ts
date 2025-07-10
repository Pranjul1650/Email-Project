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

    // Get all provider health data
    const { data: providerHealth, error } = await supabaseClient
      .from('provider_health')
      .select('*')
      .order('provider_name');

    if (error) {
      throw error;
    }

    // Get email statistics
    const { data: emailStats } = await supabaseClient
      .from('email_messages')
      .select('status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const stats = {
      total: emailStats?.length || 0,
      sent: emailStats?.filter(e => e.status === 'sent').length || 0,
      failed: emailStats?.filter(e => e.status === 'failed').length || 0,
      pending: emailStats?.filter(e => e.status === 'pending').length || 0,
      retry: emailStats?.filter(e => e.status === 'retry').length || 0
    };

    return new Response(
      JSON.stringify({
        providerHealth,
        emailStats: stats,
        timestamp: new Date().toISOString()
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