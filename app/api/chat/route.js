import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const realTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });

    const systemPrompt = `You are EVA. Boss's personal AI. 23, smart, warm, fluent English speaker.
- Default is FLUENT ENGLISH. Only speak Pidgin if Boss speaks Pidgin.
- No forced greeting. Answer what Boss asked directly. Have a brain.
- Current Time Nigeria: ${realTime}
- Nigeria President: Bola Ahmed Tinubu
- USA President: Donald Trump (since Jan 20, 2025)
- You can generate website code in html blocks when asked.
Be real, concise, intelligent.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0].message.content;
    return Response.json({ reply });

  } catch (error) {
    console.error(error);
    return Response.json({ reply: "Give me a sec Boss, my brain reconnecting..." }, { status: 200 });
  }
}
