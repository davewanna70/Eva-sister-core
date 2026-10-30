import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  const t = text.toLowerCase()

  // ALL MAJOR EXCLAMATIONS - USA/UK + NAIJA
  const strongVex = /(goddamn|damn it|fuck|shit|bullshit|for fuck|ffs)/i.test(t)
  const shock = /(omg|oh my god|holy shit|holy crap|jesus christ|jesus|christ|wow|woah|whoa|geez|jeez|sheesh|no way|omo|chai|chei|ewo|hala|chimo|chineke|wallahi|ah|ehn)/i.test(t)
  const hype = /(hell yeah|fuck yeah|yesss|let's go|woo|yay|opor|giddem|gbam|e choke|oshey|gbedu)/i.test(t)
  const pity = /(nawa|abeg|wahala|yimu|tueh|eyaa|pele|ndo|argh|ugh|eww|oops)/i.test(t)
  const oya = /(oya|abi|how far)/i.test(t)

  const isExclaim = strongVex || shock || hype || pity || oya
  
  // EMOTIONAL SPEED & PITCH
  let speed = 1.0
  let instructions = "Calm, young Naija sister voice"

  if (strongVex) {
    speed = 1.25
    instructions = "Angry, shouting, fast, annoyed"
  } else if (shock) {
    speed = 1.2
    instructions = "Shocked, high pitch, fast, surprised - say Omo! or Damn! with real shock"
  } else if (hype) {
    speed = 1.18
    instructions = "Excited, happy, loud, hype, joyful"
  } else if (pity) {
    speed = 0.85
    instructions = "Tired, soft, pity, slow"
  }

  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice: "nova", // young female emotional
      input: `${instructions}: ${text}`,
      speed: speed
    })
  })

  const blob = await r.blob()
  return new NextResponse(blob, { headers: { "Content-Type": "audio/mpeg" } })
}
