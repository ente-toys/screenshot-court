"use client";

import { useState, useCallback, useRef } from "react";
import type { CourtResult, Verdict, Participant } from "@/lib/schema";
import { playTripleBang } from "@/lib/sounds";

const audioCache = new Map<string, string>();

const VERDICT_COLORS: Record<Verdict, { bg: string; text: string; label: string }> = {
  GUILTY: { bg: "#dc2626", text: "#ffffff", label: "GUILTY" },
  NOT_GUILTY: { bg: "#16a34a", text: "#ffffff", label: "NOT GUILTY" },
  NEED_MORE_CONTEXT: { bg: "#4b5563", text: "#ffffff", label: "UNCLEAR" },
};

interface VerdictCardProps {
  result: CourtResult;
  activeVariant: string | null;
}

function ParticipantBadge({ participant }: { participant: Participant }) {
  const v = VERDICT_COLORS[participant.verdict];
  return (
    <span
      className="inline-block px-3 py-1 rounded-lg text-xs font-bold tracking-wide"
      style={{ background: v.bg, color: v.text }}
    >
      {v.label}
    </span>
  );
}

export default function VerdictCard({ result, activeVariant }: VerdictCardProps) {
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const displayOneLiner =
    activeVariant && activeVariant in result.style_variants
      ? result.style_variants[activeVariant as keyof typeof result.style_variants].one_liner
      : result.one_liner;

  const lowConfidence = result.confidence < 30 && result.meta.source === "model";
  const guiltyCount = result.participants.filter((p) => p.verdict === "GUILTY").length;
  const overallColor = guiltyCount === 0 ? "#16a34a" : guiltyCount === result.participants.length ? "#dc2626" : "#d97706";

  const handleSpeak = useCallback(async () => {
    const el = audioElRef.current;
    if (!el) return;

    // Pause/resume toggle
    if (speaking && !el.paused) {
      el.pause();
      setSpeaking(false);
      return;
    }
    if (!speaking && el.src && !el.ended && el.currentTime > 0) {
      el.play();
      setSpeaking(true);
      return;
    }

    // Keep it short to save TTS quota — just the key lines
    const lines: string[] = [displayOneLiner];
    for (const p of result.participants) {
      const verdict = p.verdict === "GUILTY" ? "Guilty!" : "Not guilty!";
      lines.push(`${p.name}, ${verdict} ${p.roast} ${p.sentence}`);
    }
    const text = lines.join(" . . . ");

    const voice = activeVariant === "genz" ? "nova" : activeVariant === "hr" ? "shimmer" : "onyx";
    const cacheKey = `${voice}:${text}`;

    // Unlock audio on user gesture — play tiny silence immediately
    el.src = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwBHAAAAAAAAAAAAAAAAAAD/+xBkAA/wAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAARMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=";
    await el.play().catch(() => {});

    // Check cache
    const cached = audioCache.get(cacheKey);
    if (cached) {
      playTripleBang();
      el.src = cached;
      el.currentTime = 0;
      await el.play();
      setSpeaking(true);
      return;
    }

    // Fetch — start gavel bangs while loading
    setLoading(true);
    playTripleBang();

    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });

      if (!res.ok) throw new Error("TTS API error");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioCache.set(cacheKey, url);

      // Wait for audio to be ready, then play
      el.src = url;
      await new Promise<void>((resolve, reject) => {
        el.oncanplaythrough = () => resolve();
        el.onerror = () => reject(new Error("Audio load error"));
        el.load();
      });
      await el.play();
      setSpeaking(true);
    } catch {
      // AI voice failed — use browser TTS as fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
    setLoading(false);
  }, [speaking, displayOneLiner, result.participants, activeVariant]);

  return (
    <div className="bg-gradient-to-br from-[#1c1917] via-[#0c0a09] to-[#1a1412] rounded-2xl p-6 sm:p-10 flex flex-col gap-5 relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${overallColor}20 0%, transparent 70%)` }}
      />

      {/* Chat type label */}
      <span className="inline-block self-start px-3 py-1 rounded-lg bg-[#292524] text-[#a8a29e] text-xs font-semibold tracking-wider uppercase relative z-[1]">
        {result.chat_type === "group" ? "Group Chat" : "DM"}
      </span>

      {/* One-liner + speak button */}
      <div className="flex items-start gap-3 relative z-[1]">
        <p className="text-2xl sm:text-3xl font-semibold leading-snug break-words flex-1">
          {displayOneLiner}
        </p>
        <button
          onClick={handleSpeak}
          disabled={loading}
          className={`shrink-0 mt-1 w-9 h-9 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
            loading
              ? "bg-wood-dark text-muted animate-pulse"
              : speaking
                ? "bg-accent text-background"
                : "bg-wood-dark text-muted hover:text-foreground hover:bg-wood-light"
          }`}
          title={loading ? "Loading..." : speaking ? "Pause" : "Read verdict aloud"}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin" />
          ) : speaking ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>

      {/* Hidden audio element — lives in DOM so browser never blocks playback */}
      <audio
        ref={audioElRef}
        onEnded={() => setSpeaking(false)}
        onError={() => setSpeaking(false)}
        preload="none"
        className="hidden"
      />

      {lowConfidence && (
        <div className="bg-[#78716c33] text-[#a8a29e] px-4 py-2 rounded-lg text-sm relative z-[1]">
          {"\u26A0"} The court squinted at this one
        </div>
      )}

      {/* Participants */}
      <div className="flex flex-col gap-5 mt-2 relative z-[1]">
        {result.participants.map((p, i) => (
          <div key={i} className="flex flex-col gap-2 bg-[#1a1917] rounded-xl p-4">
            <div className="flex items-center gap-2">
              <ParticipantBadge participant={p} />
              <span className="font-semibold text-sm sm:text-base">{p.name}</span>
            </div>
            <p className="text-sm sm:text-base text-[#fafaf9] italic leading-snug break-words">
              &ldquo;{p.roast}&rdquo;
            </p>
            {p.charges.length > 0 && (
              <ul className="flex flex-col gap-1 pl-1 mt-1">
                {p.charges.map((c, j) => (
                  <li key={j} className="text-xs sm:text-sm text-[#a8a29e] leading-relaxed">
                    {"\u2022"} {c}
                  </li>
                ))}
              </ul>
            )}
            {/* Sentence */}
            <div className={`mt-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold break-words ${
              p.verdict === "GUILTY"
                ? "bg-[#dc262615] text-[#fca5a5]"
                : p.verdict === "NOT_GUILTY"
                  ? "bg-[#16a34a15] text-[#86efac]"
                  : "bg-[#4b556315] text-[#9ca3af]"
            }`}>
              {p.verdict === "GUILTY" ? "\u2696\uFE0F " : p.verdict === "NOT_GUILTY" ? "\u2705 " : "\u2753 "}
              {p.sentence}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center relative z-[1] pt-3 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1 bg-[#292524] rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${result.confidence}%`, background: overallColor }} />
          </div>
          <span className="text-xs text-[#a8a29e]">{result.confidence}%</span>
        </div>
        <span className="text-[10px] text-[#57534e] font-medium tracking-wider">SCREENSHOT COURT</span>
      </div>
    </div>
  );
}
