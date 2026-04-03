"use client";

import type { CourtResult } from "@/lib/schema";

interface NextMoveCardProps {
  result: CourtResult;
  activeVariant: string | null;
}

export default function NextMoveCard({ result, activeVariant }: NextMoveCardProps) {
  const displayReply =
    activeVariant && activeVariant in result.style_variants
      ? result.style_variants[activeVariant as keyof typeof result.style_variants].reply_text
      : result.reply_text;

  return (
    <div className="bg-gradient-to-br from-[#1c1917] via-[#0c0a09] to-[#1a1412] rounded-2xl p-6 sm:p-10 flex flex-col gap-5 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f620 0%, transparent 70%)" }}
      />

      {/* Badge */}
      <span className="inline-block self-start px-5 py-2 rounded-xl text-sm sm:text-base font-bold tracking-wider bg-[#292524] relative z-[1]">
        YOUR NEXT MOVE
      </span>

      {/* Reply bubble */}
      <div className="bg-[#292524] rounded-2xl py-5 pr-5 pl-7 relative z-[1]">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl" />
        <p className="text-sm sm:text-lg leading-relaxed break-words">{displayReply}</p>
      </div>

      {/* Advice */}
      <div className="mt-auto pt-2 relative z-[1]">
        <p className="text-xs font-semibold text-[#a8a29e] uppercase tracking-widest mb-3">
          Next Steps
        </p>
        <ol className="flex flex-col gap-3">
          {result.advice.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed">
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-md bg-[#3f3a36] text-[#a8a29e] text-xs font-semibold shrink-0">
                {i + 1}
              </span>
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Watermark */}
      <div className="flex justify-end relative z-[1]">
        <span className="text-[10px] text-[#57534e] font-medium tracking-wider">SCREENSHOT COURT</span>
      </div>
    </div>
  );
}
