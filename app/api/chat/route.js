import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { message, userId } = await req.json()
  const user_id = userId || 'dave-main-user'

  // 1. SAVE MEMORY IF USER SAYS "remember me" or "my name is"
  if (message.toLowerCase().includes('remember') || message.toLowerCase().includes('my name is')) {
    await supabase.from('memories').insert({
      user_id: user_id,
      content: message,
    })
  }

  // 2. GET OLD MEMORIES
  const { data: memories } = await supabase
    .from('memories')
    .select('content')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const memoryContext = memories?.map(m => m.content).join('\n') || 'No memory yet'

  // 3. CALL GROQ WITH MEMORY
  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: `You are EVA, personal AI sister. Remember forever: ${memoryContext}. Always answer from memory.` },
        { role: 'user', content: message }
      ]
    })
  })

  const groqData = await groqRes.json()
  const reply = groqData.choices[0].message.content

  return NextResponse.json({ reply })
}
