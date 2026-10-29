export async function POST(req: any){
  try {
    const {message,userId}=await req.json()
    const user_id=userId||"dave"
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL
    const key=process.env.SUPABASE_SERVICE_ROLE_KEY
    const groqKey=process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_2

    if(!url || !key) return Response.json({reply:"Setup error: Supabase keys missing"}, {status:500})

    // 1. Save memory (don't crash if it fails)
    if(message && message.length>2){
      try {
        await fetch(`${url}/rest/v1/memories`,{
          method:"POST",
          headers:{"apikey":key,"Authorization":`Bearer ${key}`,"Content-Type":"application/json","Prefer":"return=minimal"},
          body:JSON.stringify({user_id,content:message})
        })
      } catch(e){ console.log("Memory save failed", e) }
    }

    // 2. Get last 30 memories
    let mem = "No memories yet"
    try {
      const res=await fetch(`${url}/rest/v1/memories?user_id=eq.${user_id}&order=created_at.desc&limit=30`,{
        headers:{"apikey":key,"Authorization":`Bearer ${key}`}
      })
      const data=await res.json()
      if(Array.isArray(data) && data.length){
        mem = data.map((d:any)=>d.content).reverse().join("\n- ")
      }
    } catch(e){ console.log("Memory fetch failed", e) }

    // 3. Ask Groq - USE NEW MODEL
    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{"Authorization":`Bearer ${groqKey}`,"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"llama-3.1-8b-instant",
        messages:[
          {role:"system",content:`You are EVA, Dave's sister with FOREVER MEMORY. You remember EVERYTHING forever.\nMemories:\n- ${mem}\nRules: Never forget anything above. If Dave mentions that car, that food, that name, recall full details from memories. List all facts when asked what you remember.`},
          {role:"user",content:message}
        ]
      })
    })
    const j=await r.json()
    
    if(!j.choices || !j.choices[0]){
      console.log("Groq error:", j)
      return Response.json({reply:`Groq error: ${JSON.stringify(j)}`})
    }

    return Response.json({reply:j.choices[0].message.content})
  } catch(err:any){
    console.log("EVA CRASH:", err)
    return Response.json({reply:`Eva crash log: ${err.message}`}, {status:200})
  }
}
