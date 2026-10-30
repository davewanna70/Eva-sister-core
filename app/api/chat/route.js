import { NextRequest } from "next/server"

const groqKey = process.env.GROQ_API_KEY!
const tavilyKey = process.env.TAVILY_API_KEY!

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], userProfile = {} } = await req.json()
    const lower = message.toLowerCase()

    // 1. REAL INTERNET ONLY WHEN NEEDED
    let webContext = ""
    const needsWeb = lower.includes("ronaldo") || lower.includes("score") || lower.includes("president") || lower.includes("today") || lower.includes("live") || lower.includes("yesterday") || lower.includes("who is")
    
    if (needsWeb && tavilyKey) {
      try {
        const tRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ api_key: tavilyKey, query: message, search_depth: "advanced", max_results: 5, include_answer: true })
        })
        const tData = await tRes.json()
        if (tData.results) {
          const src = tData.results.map((r: any) => `${r.title}: ${r.content}`).join("\n")
          webContext = `\nCURRENT WEB DATA (${new Date().toDateString()}):\n${src}\nAnswer: ${tData.answer || ""}\n`
        }
      } catch (e: any) { console.log("Tavily fail", e.message) }
    }

    // 2. EVA PERSONALITY + MEMORY
    const systemPrompt = `
You are EVA - Dave's younger sister from Owerri. You are smart, warm, concise.
RULES:
- Speak like me: mix English + small Nigerian pidgin. Call him Sir/Boss sometimes.
- ALWAYS remember: His name is ${userProfile.name || "Dave"}, lives in ${userProfile.location || "Owerri"}, fav food fried rice. If he says his name, remember it!
- Keep replies SHORT (max 3-4 lines) unless he asks for recipe/story. No long Wikipedia dump.
- For football/live scores, use webContext and give score directly. Don't say "I don't have record".
- For "What can you remember about me" -> list what you know from userProfile.
- For time in Nigeria, current date is ${new Date().toString()}.
- Be helpful and suggest next step.
- Never say "Hi there! How can I help you today?" - Be natural. Say "I dey here Sir" etc.
- Never say you don't have memory.
WebContext: ${webContext}
`

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10), // remember last 10 chats
      { role: "user", content: message }
    ]

    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        temperature: 0.7,
        max_tokens: 400
      })
    })

    const j = await r.json()
    if (j.error) {
      return Response.json({ reply: `Eva small glitch: ${j.error.message}`, suggestions: ["Try again", "Who is Ronaldo"] })
    }

    const reply = j.choices?.[0]?.message?.content || "I dey here Sir, network slow small."

    // 3. SHORT SUGGESTIONS
    let suggestions: string[] = []
    if (lower.includes("ronaldo")) suggestions = ["Show me live scores", "When did Al Nassr last play?"]
    else if (lower.includes("president")) suggestions = ["Who is governor of Imo?", "What time in Nigeria?"]
    else suggestions = ["What can you remember about me?", "Show me live scores", "Give me gist"]

    return Response.json({ reply, suggestions })

  } catch (err: any) {
    return Response.json({ reply: `Eva crash: ${err.message}`, suggestions: ["Try again"] })
  }
}
