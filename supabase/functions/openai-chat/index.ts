
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationId, isNewConversation } = await req.json()
    
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    let currentConversationId = conversationId

    // Create new conversation if needed
    if (isNewConversation || !conversationId) {
      const { data: newConversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (conversationError) {
        console.error('Error creating conversation:', conversationError)
        return new Response('Error creating conversation', { status: 500, headers: corsHeaders })
      }

      currentConversationId = newConversation.id
    }

    // Save user message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: 'user',
        content: message
      })

    if (messageError) {
      console.error('Error saving user message:', messageError)
      return new Response('Error saving message', { status: 500, headers: corsHeaders })
    }

    // Get conversation history
    const { data: messageHistory, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    if (historyError) {
      console.error('Error fetching message history:', historyError)
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are AquaBot, an expert marine aquarium assistant. You help users with:
        - Water chemistry and testing
        - Fish compatibility and care
        - Equipment recommendations
        - Troubleshooting aquarium problems
        - Setup planning and maintenance
        
        Always provide helpful, accurate advice based on marine aquarium best practices. Be friendly and encouraging while being precise with your recommendations.`
      },
      ...(messageHistory || []).slice(-10) // Last 10 messages for context
    ]

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', errorText)
      return new Response('Error from OpenAI API', { status: 500, headers: corsHeaders })
    }

    const openAIData = await openAIResponse.json()
    const assistantMessage = openAIData.choices[0]?.message?.content

    if (!assistantMessage) {
      return new Response('No response from AI', { status: 500, headers: corsHeaders })
    }

    // Save assistant message
    const { error: assistantMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage
      })

    if (assistantMessageError) {
      console.error('Error saving assistant message:', assistantMessageError)
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', currentConversationId)

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        conversationId: currentConversationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in openai-chat function:', error)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
