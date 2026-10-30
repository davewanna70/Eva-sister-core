import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { text, selectedVoice } = await req.json()
  const t = text.toLowerCase()

  const strongVex = /(goddamn|damn it|fuck|shit|bullshit|for fuck|ffs)/i.test(t)
  const shock = /(omg|oh my god|holy shit|holy crap|jesus christ|jesus|christ|wow|woah|whoa|geez|jeez|sheesh|no way|omo|chai|chei|ewo|hala|chimo|chineke|wallahi|ah|ehn)/i.test(t)
  const hype = /(hell yeah|fuck yeah|yesss|let's go|woo|yay|opor|giddem|gbam|e choke|oshey|gbedu)/i.test(t)
  const pity = /(nawa|abeg|wahala|yimu|tueh|eyaa|pele|ndo|argh|ugh|eww|oops)/i.test(t)

  let speed = 1.0
  let instructions = "Calm young adult voice"

  if (strongVex) {
    speed = 1.25
    instructions = "Angry, shouting, fast, annoyed, adult"
  } else if (shock) {
    speed = 1.2
    instructions = "Shocked, high pitch, fast, surprised with real emotion"
  } else if (hype) {
    speed = 1.18
    instructions = "Excited, happy, loud, joyful, hype"
  } else if (pity) {
    speed = 0.85
    instructions = "Tired, soft, pity, slow, sad"
  }

  // ADULT MALE / FEMALE - International
  const voice = selectedVoice === "male" ? "onyx" : "nova"
  // nova = adult female 25yrs emotional (default Eva)
  // onyx = adult male 30yrs deep strong

  const r = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice: voice,
      input: `${instructions}: ${text}`,
      speed: speed
    })
  })

  if (!r.ok) {
    return NextResponse.json({ error: "Voice failed" }, { status: 500 })
  }

  const blob = await r.blob()
  return new NextResponse(blob, { headers: { "Content-Type": "audio/mpeg" } })
}
