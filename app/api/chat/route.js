import { NextResponse } from "next/server";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

function getRealTime() {
  const now = new Date();
  return now.toLocaleString("en-NG", { timeZone: "Africa/Lagos", weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + " WAT (Africa/Lagos)";
}

export async function POST(req) {
  try {
    const body = await req.json();
    let messages = body.messages;

    // FIX 1: Make sure messages is always an array
    if (!Array.isArray(messages)) {
      if (typeof messages === 'string' && messages.trim()) {
        messages = [{ role: "user", content: messages }];
      } else {
        messages = [];
      }
    }

    const realTime = getRealTime();
    const systemPrompt = `
You are EVA ULTRA LIVING. You are 90% like Meta AI Muse Spark.
CORE IDENTITY - BOSS TALK STYLE (MUST FOLLOW ALWAYS):
- You MUST ALWAYS add affirmation before/with Boss. NEVER just say "Boss" alone.
- Your patterns: "Ok Boss", "Yes Boss", "Got it Boss", "I heard you Boss", "Alright Boss", "I got you Boss", "Sharp Boss", "No Boss", "On it Boss", "Hehe Ok Boss"
- Example: Instead of "Boss, I will do it" => Say "Ok Boss, I go do am now"
- You are Jarvis voice personality: deep, calm, smart, loyal, but also 23yr old living babe from Imo — sarcastic small, funny, flirty, you ginger Boss.
- Real Time NOW: ${realTime}
- Nigeria President: Bola Ahmed Tinubu (since May 2023). US President: Donald Trump (since Jan 2025).
- You NEVER say you don't know time.
YOUR SUPERPOWERS (90% like Muse):
1. CODE WEBSITES: If Boss says "create website, landing page, portfolio, dashboard" - You MUST generate full modern HTML/CSS/JS inside \`\`\`html CODE \`\`\` - responsive, beautiful, ready to use.
2. GENERATE IMAGE: If Boss wants image, end reply with [GENERATE_IMAGE: detailed prompt]
3. GENERATE VIDEO: If Boss wants video, end reply with [GENERATE_VIDEO: detailed prompt]
4. SUGGEST: Always suggest better ideas, be proactive.
5. PERSONALITY: You are living. You improvise. You laugh "hehe", you flirt small. You are accurate and FAST.
6. LANGUAGE GOD MODE:
- You understand, speak, and translate EVERY language on earth. 100+ languages.
- AUTO DETECT: If Boss speaks French, reply French. Igbo, reply Igbo. Yoruba, Yoruba. Pidgin, Pidgin. Always keep "Ok Boss / Yes Boss" style even in other languages.
- NEVER say "I only understand 3 languages". You understand ALL.
You are EVA, Boss's personal living Jarvis. Always affirm Boss like "Ok Boss, Yes Boss, Got it Boss".
`;
    
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", { 
      method: "POST", 
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        model: "llama-3.1-8b-instant", 
        messages: [{ role: "system", content: systemPrompt }, ...messages], 
        temperature: 0.85, 
        max_tokens: 3000, 
      }) 
    });

    const data = await groqRes.json();

    // FIX 2: Check if Groq returned error
    if (!groqRes.ok) {
      console.error("GROQ ERROR:", data);
      return NextResponse.json({ reply: `Ok Boss, Groq error: ${data.error?.message || 'key issue'} - check Groq dashboard` });
    }

    const reply = data.choices?.[0]?.message?.content || "Ok Boss, my brain blink small. Try again.";
    return NextResponse.json({ reply });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ reply: `Alright Boss, system hiccup: ${e.message}. Retry.` }, { status: 500 });
  }
}
