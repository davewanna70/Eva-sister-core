import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  const body = await req.json()
  const message = body.message || ""
  const user_id = body.userId || "dave"

  // FOREVER MEMORY: Save EVERYTHING you say, no need "remember" keyword!
  // This is automatic — anything you chat, voice or text, Eva saves it forever!
  if (message.trim().length > 2) {
    await supabase.from("memories").insert([{ 
      user_id, 
      content: message 
    }])
  }

  // Get last 30 memories — so Eva remembers even after 10 years!
  const { data } = await supabase
    .from("memories")
    .select("content")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(30)

  const mem = data && data.length > 0 
    ? data.map(d => d.content).reverse().join("\n- ") 
    : "No memories yet, this is first chat with Dave"

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { 
          role: "system", 
          content: `You are EVA, Dave's real personal AI sister for life. You have PERFECT FOREVER MEMORY.

Here is EVERYTHING Dave has ever told you since day one (oldest to newest):
- ${mem}

RULES YOU MUST FOLLOW:
1. You NEVER forget anything above. It's forever.
2. If Dave mentions "that Benz", "that car", "that food", "that babe" — search from memories above and recall full details (brand, color, price, name, everything).
3. If Dave asks "what do you remember about me?" — list ALL important facts from memories, don't say you only know tech.
4. Always be loyal, friendly, like a real sister who knows Dave since childhood.
5. You remember EVERYTHING: cars, food, business, names, places, dreams, everything — not just cars!` 
        },
        { role: "user", content: message }
      ],
      temperature: 0.7
    })
  })

  const j = await r.json()
  const reply = j.choices?.[0]?.message?.content || "Sorry Dave, Eva had small error, try again"

  return Response.json({ reply })
}
