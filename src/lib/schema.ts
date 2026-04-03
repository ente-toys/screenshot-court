import { z } from "zod";

// --- Per-participant verdicts ---

export const VERDICTS = [
  "GUILTY",
  "NOT_GUILTY",
  "NEED_MORE_CONTEXT",
] as const;

export type Verdict = (typeof VERDICTS)[number];

export const participantSchema = z.object({
  name: z.string().max(60),
  verdict: z.enum(VERDICTS),
  roast: z.string().max(140),
  sentence: z.string().max(120),
  charges: z.array(z.string().max(80)).max(3),
  evidence: z.array(z.string().max(100)).max(3),
});

export type Participant = z.infer<typeof participantSchema>;

// --- Style variants ---

export const styleVariantSchema = z.object({
  one_liner: z.string().max(200),
  reply_text: z.string().max(400),
});

// --- Full result ---

export const courtResultSchema = z.object({
  one_liner: z.string().max(140),
  chat_type: z.enum(["dm", "group"]),
  participants: z.array(participantSchema).min(1).max(6),
  reply_text: z.string().max(400),
  advice: z.tuple([
    z.string().max(100),
    z.string().max(100),
    z.string().max(100),
  ]),
  confidence: z.number().int().min(0).max(100),
  style_variants: z.object({
    judge_judy: styleVariantSchema,
    hr: styleVariantSchema,
    genz: styleVariantSchema,
  }),
});

export type CourtResultRaw = z.infer<typeof courtResultSchema>;

export type MetaSource =
  | "model"
  | "fallback_parse"
  | "fallback_validation"
  | "fallback_moderation";

export type CourtResult = CourtResultRaw & {
  meta: { source: MetaSource };
};

// --- Errors ---

export const ERROR_CODES = [
  "INVALID_IMAGE",
  "TOO_LARGE",
  "RATE_LIMITED",
  "MODEL_FAILURE",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ErrorResponse = {
  error: string;
  code: ErrorCode;
};

// --- Fallback ---

const SAFE_ONE_LINER = "The court needs a clearer screenshot to proceed.";
const SAFE_REPLY =
  "Hey, I looked at this but couldn\u2019t get a clear read. Could you send a better screenshot?";
const SAFE_ADVICE: [string, string, string] = [
  "Try uploading a clearer screenshot",
  "Make sure the full conversation is visible",
  "Crop out any personal info before uploading",
];

export function createFallbackPayload(source: MetaSource): CourtResult {
  return {
    one_liner: SAFE_ONE_LINER,
    chat_type: "dm",
    participants: [
      {
        name: "Unknown",
        verdict: "NEED_MORE_CONTEXT",
        roast: "Can\u2019t roast what we can\u2019t see.",
        sentence: "Case dismissed \u2014 pending better evidence.",
        charges: ["Insufficient evidence submitted"],
        evidence: ["Screenshot was unclear or incomplete"],
      },
    ],
    reply_text: SAFE_REPLY,
    advice: SAFE_ADVICE,
    confidence: 0,
    style_variants: {
      judge_judy: {
        one_liner: "Order in the court! I can\u2019t rule on what I can\u2019t see!",
        reply_text: SAFE_REPLY,
      },
      hr: {
        one_liner:
          "Per our review, additional documentation is required to proceed.",
        reply_text: SAFE_REPLY,
      },
      genz: {
        one_liner: "bestie the screenshot is giving nothing \ud83d\ude2d",
        reply_text: SAFE_REPLY,
      },
    },
    meta: { source },
  };
}

// --- Normalization ---

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "\u2026";
}

function truncateArray(arr: string[], max: number): string[] {
  return arr.map((s) => truncate(s, max));
}

export function normalizeResult(raw: CourtResultRaw): CourtResultRaw {
  return {
    one_liner: truncate(raw.one_liner, 140),
    chat_type: raw.chat_type,
    participants: raw.participants.map((p) => ({
      name: truncate(p.name, 60),
      verdict: p.verdict,
      roast: truncate(p.roast, 140),
      sentence: truncate(p.sentence, 120),
      charges: truncateArray(p.charges, 80),
      evidence: truncateArray(p.evidence, 100),
    })),
    reply_text: truncate(raw.reply_text, 400),
    advice: [
      truncate(raw.advice[0], 100),
      truncate(raw.advice[1], 100),
      truncate(raw.advice[2], 100),
    ],
    confidence: Math.max(0, Math.min(100, Math.round(raw.confidence))),
    style_variants: {
      judge_judy: {
        one_liner: truncate(raw.style_variants.judge_judy.one_liner, 200),
        reply_text: truncate(raw.style_variants.judge_judy.reply_text, 400),
      },
      hr: {
        one_liner: truncate(raw.style_variants.hr.one_liner, 200),
        reply_text: truncate(raw.style_variants.hr.reply_text, 400),
      },
      genz: {
        one_liner: truncate(raw.style_variants.genz.one_liner, 200),
        reply_text: truncate(raw.style_variants.genz.reply_text, 400),
      },
    },
  };
}

export const MOCK_RESULT: CourtResult = {
  one_liner: "A 72-hour ghost followed by a group-chat meltdown \u2014 the evidence is damning on both sides.",
  chat_type: "group",
  participants: [
    {
      name: "Blue Bubbles (Alex)",
      verdict: "GUILTY",
      roast: "Ghosted for 72 hours then hit \u2018em with the \u201Clol sorry just saw this\u201D \u2014 incredible audacity.",
      sentence: "Sentenced to reply to every message within 5 minutes for one full week.",
      charges: [
        "Willful neglect of the group chat for 3 days",
        "Deploying passive-aggressive \ud83d\ude42 emojis",
        "Gaslighting with \u201CI never said that\u201D",
      ],
      evidence: [
        "Timestamp shows 72-hour gap between messages",
        "Three consecutive \ud83d\ude42 in a row",
        "Quoted text contradicts denial in next message",
      ],
    },
    {
      name: "Gray Bubbles (Jordan)",
      verdict: "NOT_GUILTY",
      roast: "Held it together while chaos reigned \u2014 the adult in the group chat.",
      sentence: "Acquitted. You may leave the courtroom with your dignity intact.",
      charges: [
        "Minor offense: escalating tone unnecessarily",
      ],
      evidence: [
        "Responded within reasonable time each round",
      ],
    },
    {
      name: "Green Bubbles (Sam)",
      verdict: "GUILTY",
      roast: "Sitting there screenshotting drama for the other chat like a war correspondent.",
      sentence: "Sentenced to delete the other group chat and apologize in a voice note.",
      charges: [
        "Fanning the flames instead of mediating",
        "Sending screenshots to the other group chat",
      ],
      evidence: [
        "Visible \u201Clmaooo\u201D reactions to serious messages",
        "Mentioned \u201Cthe other chat\u201D unprompted",
      ],
    },
  ],
  reply_text:
    "Hey everyone, I think this got out of hand. Alex \u2014 the 3-day silence wasn\u2019t cool. Sam \u2014 stirring it up didn\u2019t help. Can we reset and actually plan this thing?",
  advice: [
    "Reply within 24 hours, even if it\u2019s just \u201Cgot this, will respond later\u201D",
    "Don\u2019t escalate \u2014 if it\u2019s getting heated, take it to a 1:1",
    "Keep screenshots in the vault, not the other group chat",
  ],
  confidence: 82,
  style_variants: {
    judge_judy: {
      one_liner: "Three days of silence AND screenshot leaking?! This whole chat is in contempt!",
      reply_text: "Listen up \u2014 Alex, you ghosted. Sam, you gossiped. Jordan, you\u2019re the only one with sense. Fix this or I\u2019m holding everyone in contempt.",
    },
    hr: {
      one_liner: "Multiple communication protocol violations detected across team members.",
      reply_text: "Following review of this thread, we recommend a reset. Alex: please improve response times. Sam: cross-channel sharing is not appropriate. Let\u2019s schedule a sync.",
    },
    genz: {
      one_liner: "alex ghosted, sam snitched, jordan carried \u2014 this gc is cooked \ud83d\udc80",
      reply_text: "ok so alex ur 3 day ghost era was unhinged, sam why u screenshotting to the other gc \ud83d\ude2d\ud83d\ude2d jordan ur the only real one here. can we pls just make a plan",
    },
  },
  meta: { source: "model" },
};
