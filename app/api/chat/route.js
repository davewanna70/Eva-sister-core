export async function POST(req){
  try{
    const {message} = await req.json()
    const groqKey = process.env.GROQ_API_KEY
    const tavilyKey = process.env.TAVILY_API_KEY

    if(!groqKey) return Response.json({reply:"GROQ_API_KEY missing for Vercel"})
    if(!message) return Response.json({reply:"No message"})

    let webContext = ""
    const needSearch = /price|news|today|current|latest|weather|bitcoin|eth|crypto|score|live|who won|what is happening|now/i.test(message)

    if(needSearch && tavilyKey){
      try{
        const tRes = await fetch("https://api.tavily.com/search",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            api_key: tavilyKey,
            query: message,
            search_depth: "basic",
            include_answer: true,
            max_results: 5
          })
        })
        const tData = await tRes.json()
        if(tData.results){
          const src = tData.results.map(r=>`${r.title}: ${r.content.slice(0,300)}`).join("\n\n")
          webContext = `CURRENT WEB DATA:\n${src}\n\nTavily summary: ${tData.answer||""}`
        }
      }catch(e){ console.log("Tavily fail", e.message) }
    }

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":"Bearer "+groqKey,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages:[
          {role:"system", content: `You are Eva — friendly Nigerian AI. If web data is provided, use it for real-time answers. Be concise, helpful. ${webContext}`},
          {role:"user", content: message}
        ],
        temperature: 0.3
      })
    })

    const j = await r.json()
    if(j.error) return Response.json({reply:"Groq error: "+j.error.message})
    
    return Response.json({reply: j.choices?.[0]?.message?.content || "Eva silent"})

  }catch(err){
    return Response.json({reply:"Eva crash: "+err.message})
  }
}
