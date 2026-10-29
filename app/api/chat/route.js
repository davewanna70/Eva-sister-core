export async function POST(req){
  const {message,userId}=await req.json()
  const user_id=userId||"dave"
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY

  // FOREVER MEMORY: Save every message with fetch (no package needed)
  if(message&&message.length>2){
    await fetch(`${url}/rest/v1/memories`,{
      method:"POST",
      headers:{"apikey":key,"Authorization":`Bearer ${key}`,"Content-Type":"application/json","Prefer":"return=minimal"},
      body:JSON.stringify({user_id,content:message})
    })
  }

  // Get last 30 memories
  const res=await fetch(`${url}/rest/v1/memories?user_id=eq.${user_id}&order=created_at.desc&limit=30`,{
    headers:{"apikey":key,"Authorization":`Bearer ${key}`}
  })
  const data=await res.json()
  const mem=data&&data.length?data.map(d=>d.content).reverse().join("\n- "):"No memories yet"

  const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Authorization":`Bearer ${process.env.GROQ_API_KEY}`,"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"llama3-8b-8192",
      messages:[
        {role:"system",content:`You are EVA, Dave's sister with FOREVER MEMORY. You remember EVERYTHING forever.\nMemories:\n- ${mem}\nRules: Never forget anything above. If Dave mentions that car, that food, that name, recall full details from memories. List all facts when asked what you remember.`},
        {role:"user",content:message}
      ]
    })
  })
  const j=await r.json()
  return Response.json({reply:j.choices[0].message.content})
}
