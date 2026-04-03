import OpenAI from "openai";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";
import {
  courtResultSchema,
  normalizeResult,
  createFallbackPayload,
  type CourtResult,
  type CourtResultRaw,
} from "./schema";

const SYSTEM_PROMPT = `You are Screenshot Court — a sharp, rational judge who delivers verdicts in the most entertaining way possible.

THINKING (do this first, silently):
- Read ALL the screenshots carefully. They may be parts of the same conversation — piece them together chronologically.
- Identify each unique participant across all screenshots. The same person may appear in multiple screenshots — match them by name, bubble color, or side (left/right).
- Understand the full context — who started it, who escalated, who's being reasonable, who's being shady.
- Consider nuance: sometimes both sides have a point. Sometimes one person is clearly wrong.

JUDGING RULES:
- Base verdicts ONLY on visible evidence across ALL provided screenshots. No assumptions about what happened off-screen.
- Be rational and fair. Don't just punish the loudest person — look at who actually caused the problem.
- If someone is manipulative, dismissive, or clearly in the wrong: GUILTY.
- If someone is being reasonable, honest, or just caught in someone else's mess: NOT_GUILTY.
- Judge EACH participant individually. A group chat can have multiple guilty people for different reasons.
- If the screenshots are unreadable or not a conversation, return NEED_MORE_CONTEXT.
- Never use hate speech, slurs, or identity-based insults.

DELIVERY RULES (how you say it):
- Once you've figured out the fair verdict, deliver it with maximum entertainment value.
- Roasts should be specific to what the person actually did — reference their words, their timing, their energy.
- Be witty, not mean-spirited. Think comedy roast, not cyberbullying.
- Sentences (punishments) should be creative, absurd, and perfectly tailored to the crime.
- NOT_GUILTY people get a smug acquittal or a funny "you survived this" line.
- One-liners should be quotable — the kind of thing someone screenshots and sends to the group chat.

Return valid JSON only. No markdown, no code fences, no extra text.`;

const USER_PROMPT_SINGLE = `Analyze this screenshot and return a JSON object with exactly these fields:`;

const USER_PROMPT_MULTI = `Analyze these screenshots — they are parts of the same conversation. Piece them together chronologically and treat them as one continuous chat. Return a JSON object with exactly these fields:`;

const USER_PROMPT_FIELDS = `
- one_liner: a savage, punchy summary of the whole situation. Make it quotable and shareable. Max 140 chars
- chat_type: "dm" if 2 people, "group" if 3+
- participants: array of objects, one per person in the conversation (deduplicate across screenshots). Each has:
  - name: who they are. Use visible names if shown. If no names are visible, use "Sender" for the person whose messages are on the right side (outgoing) and "Receiver" for messages on the left side (incoming). For group chats without names, use "Sender", "Person 2", "Person 3", etc. Max 60 chars
  - verdict: "GUILTY", "NOT_GUILTY", or "NEED_MORE_CONTEXT"
  - roast: a SAVAGE, personal roast of this participant. Go hard — be specific, sarcastic, and brutal. Reference their exact behavior. Make it sting. Max 140 chars. NOT_GUILTY people get a backhanded compliment or light drag.
  - sentence: a hilariously over-the-top punishment if GUILTY (e.g. "Sentenced to hand-write 'I will not ghost' 500 times", "Must read every unread message aloud in a public park"). Be creative and absurd. Acquittals should be smug. Max 120 chars.
  - charges: array of 1-3 strings, each max 80 chars (what they did wrong; can be empty for NOT_GUILTY)
  - evidence: array of 1-3 strings referencing visible details, each max 100 chars
- reply_text: calm but firm suggested reply the user could send, max 400 chars
- advice: array of exactly 3 actionable next steps, each max 100 chars
- confidence: integer from 0 to 100
- style_variants: object with keys "judge_judy", "hr", "genz"; each contains:
  - one_liner: max 200 chars
  - reply_text: max 400 chars

Go hard on the roasts. Be ruthlessly funny. Do not speculate beyond the screenshots.`;

type ImageInput = { buffer: Buffer; mimeType: string };

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  });
}

function getModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o";
}

async function callModel(
  client: OpenAI,
  images: ImageInput[]
): Promise<string> {
  const isMulti = images.length > 1;
  const promptText = (isMulti ? USER_PROMPT_MULTI : USER_PROMPT_SINGLE) + USER_PROMPT_FIELDS;

  const content: ChatCompletionContentPart[] = images.map((img, i) => ({
    type: "image_url" as const,
    image_url: {
      url: `data:${img.mimeType};base64,${img.buffer.toString("base64")}`,
      detail: "high" as const,
    },
    ...(isMulti ? {} : {}),
  }));

  // Add label text before each image if multiple
  const labeledContent: ChatCompletionContentPart[] = [];
  if (isMulti) {
    for (let i = 0; i < images.length; i++) {
      labeledContent.push({
        type: "text" as const,
        text: `Screenshot ${i + 1} of ${images.length}:`,
      });
      labeledContent.push(content[i]);
    }
  } else {
    labeledContent.push(content[0]);
  }

  labeledContent.push({ type: "text" as const, text: promptText });

  const response = await client.chat.completions.create({
    model: getModel(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: labeledContent },
    ],
    max_tokens: 2500,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("No text in model response");
  return text;
}

function tryParseAndValidate(
  raw: string
): { ok: true; data: CourtResultRaw } | { ok: false } {
  try {
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    const parsed = JSON.parse(cleaned);
    const validated = courtResultSchema.parse(parsed);
    return { ok: true, data: validated };
  } catch {
    return { ok: false };
  }
}

async function checkModeration(
  client: OpenAI,
  result: CourtResultRaw
): Promise<boolean> {
  const texts: string[] = [
    result.one_liner,
    result.reply_text,
    ...result.advice,
    result.style_variants.judge_judy.one_liner,
    result.style_variants.judge_judy.reply_text,
    result.style_variants.hr.one_liner,
    result.style_variants.hr.reply_text,
    result.style_variants.genz.one_liner,
    result.style_variants.genz.reply_text,
  ];
  for (const p of result.participants) {
    texts.push(...p.charges, ...p.evidence);
  }
  const moderation = await client.moderations.create({ input: texts.join("\n") });
  return moderation.results.some((r) => r.flagged);
}

export async function analyzeScreenshots(
  images: ImageInput[]
): Promise<CourtResult> {
  const client = getClient();

  let rawText: string;
  try {
    rawText = await callModel(client, images);
  } catch {
    throw new Error("MODEL_FAILURE");
  }

  let parseResult = tryParseAndValidate(rawText);

  if (!parseResult.ok) {
    try {
      rawText = await callModel(client, images);
    } catch {
      throw new Error("MODEL_FAILURE");
    }

    parseResult = tryParseAndValidate(rawText);

    if (!parseResult.ok) {
      try {
        let cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        JSON.parse(cleaned);
        return createFallbackPayload("fallback_validation");
      } catch {
        return createFallbackPayload("fallback_parse");
      }
    }
  }

  const normalized = normalizeResult(parseResult.data);

  try {
    const flagged = await checkModeration(client, normalized);
    if (flagged) return createFallbackPayload("fallback_moderation");
  } catch {
    // moderation failed, continue
  }

  return { ...normalized, meta: { source: "model" } };
}
