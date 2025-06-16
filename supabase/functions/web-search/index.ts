
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()

    // Check if Perplexity API key is available
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not found in environment variables')
      return new Response('Perplexity API key not configured', { status: 500, headers: corsHeaders })
    }

    console.log('Making web search request for:', query)

    // Call Perplexity API for real-time web search
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert marine aquarium assistant. Provide accurate, up-to-date information about marine aquarium keeping, equipment, fish care, and water chemistry. Focus on current best practices and recent developments in the hobby.'
          },
          {
            role: 'user',
            content: `Search for current information about: ${query}. Please provide detailed, accurate information with current best practices.`
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: 'month',
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Perplexity API error:', errorText)
      return new Response('Error from Perplexity API', { status: 500, headers: corsHeaders })
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No response from Perplexity')
      return new Response('No response from search API', { status: 500, headers: corsHeaders })
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in web-search function:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
