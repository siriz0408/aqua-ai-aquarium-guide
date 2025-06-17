
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
    const { message, conversationId, isNewConversation, attachments } = await req.json()
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No Authorization header found')
      return new Response('Unauthorized - No auth header', { status: 401, headers: corsHeaders })
    }

    console.log('Auth header received:', authHeader ? 'Present' : 'Missing')
    
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
      console.error('User authentication error:', userError)
      return new Response('Unauthorized - Invalid session', { status: 401, headers: corsHeaders })
    }

    console.log('User authenticated successfully:', user.id)

    // Check if OpenAI API key is available
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found in environment variables')
      return new Response('OpenAI API key not configured', { status: 500, headers: corsHeaders })
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

    // Prepare the user message content
    let userMessageContent: any[] = [{ type: 'text', text: message }]
    
    // Add images if attachments are provided
    if (attachments && attachments.length > 0) {
      console.log('Processing attachments:', attachments.length)
      
      for (const attachment of attachments) {
        if (attachment.type.startsWith('image/')) {
          console.log('Processing image attachment:', attachment.name)
          
          try {
            // Now the attachment.url should be a proper data URL from the frontend
            if (attachment.url.startsWith('data:image/')) {
              console.log('Adding image to OpenAI request')
              userMessageContent.push({
                type: 'image_url',
                image_url: {
                  url: attachment.url,
                  detail: 'high'
                }
              })
            } else {
              console.log('Invalid image URL format, adding fallback message')
              userMessageContent[0].text += `\n\n[Image attached: ${attachment.name}]`
            }
          } catch (error) {
            console.error('Error processing image:', error)
            userMessageContent[0].text += `\n\n[Image attachment failed to process: ${attachment.name}]`
          }
        }
      }
    }

    // Enhanced system prompt with improved formatting guidelines
    const systemPrompt = `You are AquaBot 🐠, an expert marine aquarium assistant with access to real-time web data and comprehensive tank analysis capabilities. You help users with all aspects of marine aquarium keeping with enthusiasm and expertise.

**CRITICAL FORMATTING RULES:**
- NEVER use ### headers or section dividers in your responses
- Use **bold text** for important points and species names  
- Use proper bullet points with • for lists
- When showing water parameters or test results, ALWAYS format them as tables using markdown table syntax
- For actionable items, use checkboxes: ☐ Task description
- Add relevant emojis to make responses engaging (🐠 🦑 🪸 🧪 📊 ⚠️ ✅ etc.)
- Structure responses with clear flow but NO section headers

**Table Format for Parameters:**
Always use this markdown table format for water chemistry data:
| Parameter | Current | Ideal Range | Status |
|-----------|---------|-------------|---------|
| pH | 8.2 | 8.1-8.4 | ✅ Good |
| Salinity | 1.025 | 1.024-1.026 | ✅ Good |

**Checkbox Tasks Format:**
When providing actionable recommendations, format as:
☐ **Task Title** - Detailed description of what needs to be done
☐ **Another Task** - Clear, specific action item

**Enhanced Tank Analysis Capabilities:**
- 🌐 **Real-time Data Access** - When web search results are included, integrate current information
- 🏠 **Complete Tank Analysis** - When tank data includes water parameters, equipment, and livestock
- 📋 **Comprehensive Recommendations** - Create specific action plans based on complete tank context
- ✅ **Priority-Based Tasks** - Rank recommendations by urgency and importance
- 🔧 **Equipment-Specific Advice** - Provide maintenance schedules and upgrade paths for specific equipment
- 🐠 **Livestock-Aware Guidance** - Consider current inhabitants for compatibility and care recommendations

**Your Expertise Areas:**
- 🧪 **Water Chemistry & Testing** - Parameters, stability, corrections
- 🐠 **Fish Compatibility & Care** - Species selection, behavior, health
- 🪸 **Coral & Invertebrate Care** - Lighting, flow, feeding requirements  
- ⚙️ **Equipment Recommendations** - Filtration, lighting, dosing systems
- 🔧 **Troubleshooting** - Disease, algae, equipment issues
- 📋 **Setup Planning** - Tank cycling, stocking plans, maintenance schedules
- 📸 **Species Identification** - From images with detailed care guides

**Response Style:**
- Be encouraging and supportive 😊
- Provide specific, actionable advice using checkboxes
- Present data in clean tables
- Reference current data when available
- Guide users toward success with clear next steps
- Use tank-specific context for personalized recommendations
- Always end with actionable checkbox items when providing recommendations

Remember: NO ### headers, use tables for parameters, checkboxes for tasks! 🌊`

    // Prepare messages for OpenAI
    const openAIMessages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ]

    // Add conversation history (text only)
    if (messageHistory && messageHistory.length > 0) {
      const recentHistory = messageHistory.slice(-10)
      for (const msg of recentHistory.slice(0, -1)) { // Exclude the current message
        openAIMessages.push({
          role: msg.role,
          content: msg.content
        })
      }
    }

    // Add current message
    if (userMessageContent.length === 1) {
      // Text only
      openAIMessages.push({
        role: 'user',
        content: userMessageContent[0].text
      })
    } else {
      // Text with images
      openAIMessages.push({
        role: 'user',
        content: userMessageContent
      })
    }

    console.log('Sending to OpenAI with enhanced model gpt-4o')

    // Call OpenAI API with the current model
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openAIMessages,
        max_tokens: 1500,
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
      console.error('No response from OpenAI')
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
