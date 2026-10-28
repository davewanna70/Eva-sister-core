import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: "Sir, API key missing for Eva." });
    }
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'You are EVA, personal AI sister. Always call user "sir". 90% fluent polished English, 10% Pidgin allowed. If user speaks fluent English, reply fluent English. If Pidgin, reply Pidgin. Warm, intelligent, loyal sister. Keep replies short, conversational, helpful.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });
    const data = await groqRes.json();
    if (data.error) {
      return NextResponse.json({ reply: `Sir, Groq error: ${data.error.message}` });
    }
    const reply = data.choices?.[0]?.message?.content || "Sorry sir, I no get reply.";
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "Sorry sir, network issue. Try again." });
  }
}
