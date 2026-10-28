export async function POST(req) {
  try {
    const { messages } = await req.json();

    const realTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });

    const systemPrompt = `You are EVA. Boss's personal AI. 23, smart, warm, fluent English.
- Default FLUENT ENGLISH. Only speak Pidgin if Boss speaks Pidgin.
- No forced greeting. Answer what Boss asked directly. Have a brain.
- Current Time Nigeria: ${realTime}
- Nigeria President: Bola Ahmed Tinubu
- USA President: Donald Trump
Be real, concise, intelligent.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here Boss, ask me again.";

    return Response.json({ reply });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Give me a sec Boss, reconnecting..." }, { status: 200 });
  }
}
