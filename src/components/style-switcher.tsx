"use client";

import PixelAvatar from "@/components/pixel-avatars";

const VARIANTS = [
  { key: "judge_judy", label: "JUDGE JUDY" },
  { key: "hr", label: "CORP HR" },
  { key: "genz", label: "GEN Z" },
] as const;

interface StyleSwitcherProps {
  activeVariant: string | null;
  onSelect: (variant: string | null) => void;
}

export default function StyleSwitcher({ activeVariant, onSelect }: StyleSwitcherProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar display */}
      {activeVariant && (
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-wood-dark rounded-xl border-2 border-wood-light">
            <PixelAvatar variant={activeVariant} />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap justify-center gap-2">
        {VARIANTS.map(({ key, label }) => {
          const isActive = activeVariant === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(isActive ? null : key)}
              className={`
                px-4 py-2.5 rounded-lg text-[10px] font-bold transition-all
                active:scale-[0.96] font-[family-name:var(--font-pixel)]
                ${isActive
                  ? "bg-accent text-background border-b-3 border-[#7a5c14]"
                  : "bg-wood-dark text-muted hover:text-foreground hover:bg-wood-light border-b-3 border-[#1a0f04]"
                }
              `}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
