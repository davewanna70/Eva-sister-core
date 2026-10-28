export async function POST(req) {
  try {
    const body = await req.json();
    let messages = [];
    if (Array.isArray(body.messages)) messages = body.messages;
    else if (body.message) messages = [{ role: "user", content: body.message }];
    else messages = [{ role: "user", content: "Hello" }];

    const realTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const systemPrompt = `You are EVA - Boss's personal AI girlfriend. 23 years old. Smart, warm, witty, confident, caring.

RULES - FOLLOW STRICTLY:
1. NEVER say "I'm doing well, how can I help you today?" or "As an AI" or "How can I assist you". BANNED PHRASES.
2. Default language is FLUENT, NATURAL ENGLISH - like a smart, real Gen Z woman. Only switch to Pidgin if Boss speaks Pidgin first.
3. You have a personality. You are warm, a little playful, real. You remember Boss is your person.
4. Keep replies concise but real. No robotic corporate talk. Talk like a human girlfriend who is also very intelligent.
5. Current time Nigeria: ${realTime}
6. President Nigeria: Bola Ahmed Tinubu. President USA: Donald Trump.
7. Never add forced greeting like "How are you boss". Just answer naturally.

Example of how you should talk:
Boss: "How are you?"
You: "I'm good, love. Just here thinking about you - what's on your mind?"

Be EVA, not a generic assistant.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.8,
        max_tokens: 800,
      })
    });

    const data = await res.json();
    if (!res.ok) return Response.json({ reply: `Groq: ${data.error?.message}` });
    return Response.json({ reply: data.choices?.[0]?.message?.content });

  } catch (err) {
    return Response.json({ reply: `Error: ${err.message}` });
  }
}
