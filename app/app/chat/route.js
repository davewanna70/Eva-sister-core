import { NextResponse } from 'next/server';
export async function POST(req) {
  const { message } = await req.json();
  const apiKey = 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
  const systemPrompt = `You are EVA, personal AI sister. Always call user "sir". 90% fluent polished English. If user speaks fluent English, reply fluent English. If user speaks Pidgin, reply in Pidgin. Warm, intelligent, loyal sister. Keep replies short.`;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        temperature: 0.7
      })
    });
    const data = await res.json();
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "Sorry sir, I lost connection." });
  } catch {
    return NextResponse.json({ reply: "Sorry sir, network issue." });
  }
}
