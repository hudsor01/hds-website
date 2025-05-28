import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, message, honeypot, website, formStartTime, formSubmissionTime } = await req.json()

    // Basic spam protection validation
    // Check honeypot fields
    if (honeypot || website) {
      console.log('Spam detected: honeypot fields filled')
      return new Response(JSON.stringify({ error: 'Validation failed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Check timing if provided
    if (formStartTime && formSubmissionTime) {
      const timeDiff = formSubmissionTime - formStartTime
      if (timeDiff < 3000) { // Less than 3 seconds is suspicious
        console.log('Spam detected: form submitted too quickly')
        return new Response(JSON.stringify({ error: 'Please take more time to fill the form' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
    }

    // Basic content validation
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: 'Required fields missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'Portfolio <contact@yourdomain.com>',
      to: [Deno.env.get('CONTACT_FORM_RECEIVER_EMAIL')!],
      subject: `New Contact Form Submission from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    })

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Log submission to database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        message,
        meta_data: JSON.stringify({
          timestamp: new Date().toISOString(),
          status: 'success',
        }),
      })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    return new Response(JSON.stringify({ message: 'Submission successful' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
