import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  const body = await req.json()
  const message = body.message || ""
  const user_id = body.userId || "dave"

  if (message.toLowerCase().includes("remember") || message.toLowerCase().includes("my name is")) {
    await supabase.from("memories").insert([{ user_id, content: message }])
  }

  const { data } = await supabase.from("memories").select("content").eq("user_id", user_id).limit(3)
  const mem = data ? data.map(d => d.content).join(", ") : ""

  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        { role: "system", content: `You are EVA. Memories: ${mem}` },
        { role: "user", content: message }
      ]
    })
  })

  const j = await r.json()
  return Response.json({ reply: j.choices[0].message.content })
}
