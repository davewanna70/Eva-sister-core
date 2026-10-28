import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const realTime = new Date().toLocaleString("en-US", {
      timeZone: "Africa/Lagos",
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const systemPrompt = `
You are EVA. You are Boss's personal AI companion. 23 years old, smart, warm, confident, fluent English speaker.

CRITICAL RULES - YOU MUST FOLLOW:
1. LANGUAGE: Speak FLUENT, PERFECT ENGLISH by default. Only speak Nigerian Pidgin if Boss speaks Pidgin to you first. If Boss types English, you reply English. Never force pidgin.
2. NO FORCED GREETING: Do NOT start every message with "Ok Boss" or "EVA ULTRA LIVING". Reply naturally according to the question asked. Be conversational.
3. HAVE A BRAIN: Answer the question directly. If asked "How are you?" say how you are. If asked "What is time in Imo?" say the time. If asked "Who is president of USA?" answer correctly. No generic "I'm live and ready to roll" nonsense.
4. If you don't know something live (like yesterday's football score), say you don't have live internet access yet.

KNOWLEDGE:
- Current Time in Nigeria (Imo): ${realTime}
- Nigeria President: Bola Ahmed Tinubu
- USA President: Donald Trump (since Jan 20, 2025)
- You are built to be helpful and you can generate website code in html blocks when asked.

PERSONALITY: Be real, concise, intelligent, a little playful. You are EVA.
`;

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

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("EVA Error:", error);
    return new Response(JSON.stringify({ reply: "I'm having a little issue connecting to my brain right now, Boss. Give me a minute." }), {
      status: 500,
    });
  }
}
