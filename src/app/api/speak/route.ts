import { NextRequest, NextResponse } from "next/server";

const BELLA_ID = "EXAVITQu4vr4xnSDxMaL";

// Same voice, different settings per personality
const VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  onyx: { stability: 0.6, similarity_boost: 0.8, style: 0.4, speed: 0.9 },     // Judge Judy — steady, authoritative
  nova: { stability: 0.3, similarity_boost: 0.7, style: 0.9, speed: 1.15 },     // Gen Z — expressive, fast
  shimmer: { stability: 0.7, similarity_boost: 0.9, style: 0.2, speed: 0.95 },  // Corporate HR — calm, measured
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 500 });
  }

  try {
    const { text, voice } = await request.json();

    if (!text || typeof text !== "string" || text.length > 1500) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const settings = VOICE_SETTINGS[voice || "onyx"] || VOICE_SETTINGS.onyx;

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${BELLA_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: settings.stability,
          similarity_boost: settings.similarity_boost,
          style: settings.style,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs error:", res.status, err);
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const buffer = Buffer.from(await res.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
