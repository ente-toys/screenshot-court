# Screenshot Court

Upload a text conversation screenshot. Get a verdict, roasts, sentences, and a calm reply.

Screenshot Court analyzes your text conversations with AI, identifies each participant, delivers per-person verdicts with savage roasts and creative punishments — then lets you share the results.

## Features

- **Multi-participant verdicts** — identifies everyone in the conversation (DMs or group chats) and judges each person individually
- **Savage roasts & sentences** — each guilty participant gets a personalized roast and an absurdly creative punishment
- **Voice styles** — switch between Judge Judy, Gen Z, and Corporate HR personalities with animated pixel avatars
- **Text-to-speech** — hear the verdict read aloud via ElevenLabs AI voice (browser TTS fallback)
- **Court sound effects** — gavel bangs, dramatic reveals, guilty buzzers, acquittal chimes
- **Export & share** — download verdict cards as PNG or share directly via Web Share API
- **Copy reply** — get a calm, suggested reply you can paste right into the conversation
- **Pixel art theme** — Minecraft-style fonts, animated pixel judge, courtroom UI

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| AI Model | OpenAI-compatible API (GPT-4o / Azure OpenAI) |
| Voice | ElevenLabs TTS (with browser fallback) |
| Validation | Zod |
| Upload | react-dropzone + browser-image-compression |
| Export | html2canvas |
| Fonts | Press Start 2P + Silkscreen |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```
OPENAI_API_KEY=your-openai-or-azure-key
OPENAI_BASE_URL=https://your-endpoint/openai/v1  # optional, for Azure
OPENAI_MODEL=gpt-4o
ELEVENLABS_API_KEY=your-elevenlabs-key  # optional, for AI voice
```

```bash
# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. **Upload** a screenshot of a text conversation
2. The image is compressed and sent to `/api/analyze`
3. A vision-capable LLM identifies participants and judges each one
4. Results render as shareable cards with verdicts, roasts, charges, and sentences
5. Switch voice styles to hear different personalities deliver the verdict

## License

MIT
