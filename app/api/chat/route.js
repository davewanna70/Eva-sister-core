export async function POST(req){
  try{
    const body = await req.json()
    const message = body.message
    const userId = body.userId
    const user_id = userId || "dave"
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    const groqKey = process.env.GROQ_API_KEY

    if(!url || !key){
      return Response.json({reply:"Setup error: Supabase keys missing"})
    }

    if(message && message.length > 2){
      try{
        await fetch(url + "/rest/v1/memories",{
          method:"POST",
          headers:{
            "apikey": key,
            "Authorization": "Bearer " + key,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body: JSON.stringify({user_id: user_id, content: message})
        })
      }catch(e){}
    }

    let mem = "No memories yet"
    try{
      const res = await fetch(url + "/rest/v1/memories?user_id=eq." + user_id + "&order=created_at.desc&limit=30",{
        headers:{ "apikey": key, "Authorization": "Bearer " + key }
      })
      const data = await res.json()
      if(Array.isArray(data) && data.length > 0){
        mem = data.map(function(d){return d.content}).reverse().join("\n- ")
      }
    }catch(e){}

    const now = new Date().toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })

    const systemPrompt = `You are EVA, Dave's sister. Short, friendly, real.
Current time: ${now} Lagos.
You have REAL web search - use it for news, scores, prices, presidents.

RULES: Max 3 lines. ONLY use Memories list for personal facts. No invented specs. No <br> tables.
Memories:
- ${mem}`

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization": "Bearer " + groqKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "compound-beta",
        messages: [
          {role: "system", content: systemPrompt},
          {role: "user", content: message}
        ],
        temperature: 0.2
      })
    })

    const j = await r.json()
    if(!j.choices || !j.choices[0]){
      return Response.json({reply: "Groq error: " + JSON.stringify(j)})
    }
    return Response.json({reply: j.choices[0].message.content})
  }catch(err){
    return Response.json({reply: "Eva crash: " + err.message})
  }
}
