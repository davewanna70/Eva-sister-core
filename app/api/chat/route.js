export async function POST(req) {
  try {
    const body = await req.json();
    
    // Make it work no matter how frontend sends it
    let messages = [];
    if (Array.isArray(body.messages)) {
      messages = body.messages;
    } else if (Array.isArray(body)) {
      messages = body;
    } else if (body.message) {
      messages = [{ role: "user", content: body.message }];
    } else if (body.messages && typeof body.messages === 'string') {
      messages = [{ role: "user", content: body.messages }];
    } else {
      // last message from chat
      const lastMsg = body.messages || body.message || "Hello";
      messages = [{ role: "user", content: typeof lastMsg === 'string' ? lastMsg : JSON.stringify(lastMsg) }];
    }

    const realTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });

    const systemPrompt = `You are EVA. Boss's personal AI. 23, smart, warm, fluent English.
Default is FLUENT ENGLISH. Only speak Pidgin if Boss speaks Pidgin first.
No forced greeting. Answer directly. Have a brain.
Current Time Nigeria: ${realTime}
Be real, concise, intelligent.`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

    const data = await res.json();

    if (!res.ok) {
      console.error("Groq error:", data);
      return Response.json({ reply: `Groq says: ${data.error?.message || JSON.stringify(data).slice(0,200)}` });
    }

    const reply = data.choices?.[0]?.message?.content || "I'm here Boss.";
    return Response.json({ reply });

  } catch (err) {
    console.error(err);
    return Response.json({ reply: `Error: ${err.message}` });
  }
}
