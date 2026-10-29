export async function POST(req){
try{
const body=await req.json()
const groqKey=process.env.GROQ_API_KEY
const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{
method:"POST",
headers:{"Authorization":"Bearer "+groqKey,"Content-Type":"application/json"},
body:JSON.stringify({
model:"compound-beta",
messages:[{role:"user",content:body.message}],
temperature:0.2
})
})
const j=await r.json()
return Response.json({reply:j.choices?.[0]?.message?.content || "Groq error: "+JSON.stringify(j)})
}catch(err){return Response.json({reply:"Eva crash: "+err.message})}
}
