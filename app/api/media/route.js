import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, type } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });
    const cleanPrompt = encodeURIComponent(prompt);
    if (type === "video") {
      const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?model=turbo&width=1024&height=576&nologo=true&enhance=true&seed=${Date.now()}`;
      return NextResponse.json({ url, type: "video" });
    } else {
      const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?model=flux&width=1024&height=1024&nologo=true&enhance=true&seed=${Date.now()}`;
      return NextResponse.json({ url, type: "image" });
    }
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
