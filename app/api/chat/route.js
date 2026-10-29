import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const { message, userId } = await req.json()
  const user_id = userId || 'dave-main-user'

  if (message.toLowerCase().includes('remember') || message.toLowerCase().includes('my name is')) {
    await supabase.from('memories').insert({ user_id, content: message })
  }

  const { data: memories } = await supabase
    .from('memories')
    .select('content')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(5)

  const memoryContext = memories?.map(m => m.content).join('\n') || 'No memory yet'

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: `You are EVA, remember forever: ${memoryContext}` },
        { role: 'user', content: message }
      ]
    })
  })

  const groqData = await groqRes.json()
  const reply = groqData.choices[0].message.content

  return new Response(JSON.stringify({ reply }), { status: 200 })
}
