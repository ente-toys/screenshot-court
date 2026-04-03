"use client";

import { useState, useEffect } from "react";

interface PixelAvatarProps {
  variant: string;
}

function useMouthAnimation(interval = 600) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOpen((o) => !o), interval);
    return () => clearInterval(id);
  }, [interval]);
  return open;
}

function JudgeJudy({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg viewBox="0 0 80 90" width="20" height="22" style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}>
      {/* Hair back */}
      <rect x="16" y="8" width="48" height="40" rx="8" fill="#5c3420" />
      <rect x="12" y="20" width="14" height="28" rx="4" fill="#5c3420" />
      <rect x="54" y="20" width="14" height="28" rx="4" fill="#5c3420" />
      {/* Face */}
      <rect x="22" y="18" width="36" height="34" rx="6" fill="#dba87a" />
      {/* Hair bangs */}
      <rect x="20" y="10" width="40" height="14" rx="4" fill="#6b3a1f" />
      <rect x="18" y="14" width="10" height="10" rx="2" fill="#6b3a1f" />
      <rect x="52" y="14" width="10" height="10" rx="2" fill="#6b3a1f" />
      {/* Glasses frames */}
      <rect x="24" y="28" width="14" height="12" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <rect x="42" y="28" width="14" height="12" rx="3" fill="none" stroke="#1a1a1a" strokeWidth="2.5" />
      <line x1="38" y1="33" x2="42" y2="33" stroke="#1a1a1a" strokeWidth="2" />
      {/* Eyes */}
      <circle cx="31" cy="34" r="3" fill="#2d4a6f" />
      <circle cx="49" cy="34" r="3" fill="#2d4a6f" />
      <circle cx="32" cy="33" r="1" fill="#fff" />
      <circle cx="50" cy="33" r="1" fill="#fff" />
      {/* Blush */}
      <circle cx="26" cy="40" r="3" fill="#e8a0a0" opacity="0.4" />
      <circle cx="54" cy="40" r="3" fill="#e8a0a0" opacity="0.4" />
      {/* Mouth */}
      {mouthOpen ? (
        <ellipse cx="40" cy="45" rx="4" ry="3" fill="#8b4a4a" />
      ) : (
        <line x1="36" y1="45" x2="44" y2="45" stroke="#8b4a4a" strokeWidth="2" strokeLinecap="round" />
      )}
      {/* Neck */}
      <rect x="35" y="52" width="10" height="6" fill="#dba87a" />
      {/* Blazer */}
      <rect x="18" y="56" width="44" height="34" rx="4" fill="#2a2a3a" />
      {/* Sweater/collar */}
      <rect x="30" y="56" width="20" height="14" rx="2" fill="#b8a88a" />
      <rect x="34" y="56" width="12" height="8" rx="1" fill="#c8b89a" />
      {/* Lapels */}
      <path d="M30 56 L38 70 L30 70 Z" fill="#222233" />
      <path d="M50 56 L42 70 L50 70 Z" fill="#222233" />
    </svg>
  );
}

function GenZ({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg viewBox="0 0 80 90" width="20" height="22" style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}>
      {/* Hoodie hood */}
      <rect x="12" y="6" width="56" height="46" rx="12" fill="#222" />
      <rect x="16" y="10" width="48" height="38" rx="10" fill="#2a2a2a" />
      {/* Face */}
      <rect x="22" y="18" width="36" height="32" rx="6" fill="#d4a574" />
      {/* Hair under hood */}
      <rect x="22" y="16" width="36" height="8" rx="3" fill="#1a1a1a" />
      {/* Eyes - half closed/cool */}
      <rect x="28" y="32" width="10" height="5" rx="2" fill="#fff" />
      <rect x="42" y="32" width="10" height="5" rx="2" fill="#fff" />
      <circle cx="34" cy="34" r="2.5" fill="#1a1a1a" />
      <circle cx="48" cy="34" r="2.5" fill="#1a1a1a" />
      {/* Eyebrows - angled cool */}
      <line x1="27" y1="28" x2="37" y2="30" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="53" y1="28" x2="43" y2="30" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="27" cy="40" r="3" fill="#e8a0a0" opacity="0.35" />
      <circle cx="53" cy="40" r="3" fill="#e8a0a0" opacity="0.35" />
      {/* Smirk/mouth */}
      {mouthOpen ? (
        <ellipse cx="40" cy="44" rx="4" ry="3" fill="#8b4a4a" />
      ) : (
        <path d="M36 43 Q40 47 44 43" fill="none" stroke="#8b4a4a" strokeWidth="2" strokeLinecap="round" />
      )}
      {/* Earrings */}
      <circle cx="22" cy="38" r="2" fill="#22c55e" />
      <circle cx="58" cy="38" r="2" fill="#22c55e" />
      {/* Neck */}
      <rect x="35" y="50" width="10" height="6" fill="#d4a574" />
      {/* Chain necklace */}
      <path d="M28 54 Q40 60 52 54" fill="none" stroke="#c49a1a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="40" cy="59" r="3" fill="#c49a1a" />
      {/* Hoodie body */}
      <rect x="18" y="54" width="44" height="36" rx="4" fill="#222" />
      {/* Gold shoulder epaulettes */}
      <rect x="18" y="56" width="8" height="4" rx="1" fill="#c49a1a" />
      <rect x="54" y="56" width="8" height="4" rx="1" fill="#c49a1a" />
      {/* Hoodie graphic */}
      <text x="28" y="76" fill="#4a4a4a" fontSize="8" fontFamily="monospace" fontWeight="bold">Z-CT</text>
    </svg>
  );
}

function CorporateHR({ mouthOpen }: { mouthOpen: boolean }) {
  return (
    <svg viewBox="0 0 80 90" width="20" height="22" style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}>
      {/* Hair back */}
      <rect x="16" y="8" width="48" height="42" rx="10" fill="#5c3420" />
      <rect x="12" y="22" width="12" height="24" rx="4" fill="#5c3420" />
      <rect x="56" y="22" width="12" height="24" rx="4" fill="#5c3420" />
      {/* Hair wave detail */}
      <ellipse cx="14" cy="30" rx="5" ry="8" fill="#4a2a14" />
      <ellipse cx="66" cy="30" rx="5" ry="8" fill="#4a2a14" />
      {/* Face */}
      <rect x="22" y="18" width="36" height="34" rx="6" fill="#dba87a" />
      {/* Hair bangs */}
      <rect x="22" y="10" width="36" height="12" rx="4" fill="#5c3420" />
      <path d="M26 14 Q40 20 54 14" fill="#5c3420" />
      {/* Glasses - thin/professional */}
      <ellipse cx="31" cy="33" rx="7" ry="5.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <ellipse cx="49" cy="33" rx="7" ry="5.5" fill="none" stroke="#888" strokeWidth="1.5" />
      <line x1="38" y1="33" x2="42" y2="33" stroke="#888" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="31" cy="33" r="2.5" fill="#3d2a1a" />
      <circle cx="49" cy="33" r="2.5" fill="#3d2a1a" />
      <circle cx="32" cy="32" r="1" fill="#fff" />
      <circle cx="50" cy="32" r="1" fill="#fff" />
      {/* Eyebrows */}
      <line x1="26" y1="26" x2="36" y2="27" stroke="#4a2a14" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="54" y1="26" x2="44" y2="27" stroke="#4a2a14" strokeWidth="1.5" strokeLinecap="round" />
      {/* Subtle smile / mouth */}
      {mouthOpen ? (
        <ellipse cx="40" cy="44" rx="3.5" ry="2.5" fill="#8b4a4a" />
      ) : (
        <path d="M36 44 Q40 47 44 44" fill="none" stroke="#c47a6a" strokeWidth="1.5" strokeLinecap="round" />
      )}
      {/* Neck */}
      <rect x="35" y="52" width="10" height="6" fill="#dba87a" />
      {/* Blazer */}
      <rect x="18" y="56" width="44" height="34" rx="4" fill="#4a4a54" />
      {/* Teal sweater/blouse */}
      <rect x="30" y="56" width="20" height="14" rx="2" fill="#7aaa9a" />
      <rect x="34" y="56" width="12" height="6" rx="1" fill="#8abaa8" />
      {/* Lapels */}
      <path d="M30 56 L38 70 L30 70 Z" fill="#3a3a44" />
      <path d="M50 56 L42 70 L50 70 Z" fill="#3a3a44" />
      {/* ID badge */}
      <rect x="46" y="66" width="8" height="10" rx="1" fill="#e8e4df" />
      <rect x="48" y="68" width="4" height="2" rx="0.5" fill="#aaa" />
      <rect x="47" y="72" width="6" height="1" fill="#ccc" />
    </svg>
  );
}

export default function PixelAvatar({ variant }: PixelAvatarProps) {
  const mouthOpen = useMouthAnimation(500);

  const avatar = (() => {
    switch (variant) {
      case "judge_judy":
        return <JudgeJudy mouthOpen={mouthOpen} />;
      case "genz":
        return <GenZ mouthOpen={mouthOpen} />;
      case "hr":
        return <CorporateHR mouthOpen={mouthOpen} />;
      default:
        return null;
    }
  })();

  return (
    <div style={{ width: 80, height: 90, imageRendering: "pixelated", overflow: "hidden" }}>
      <div style={{ transform: "scale(4)", transformOrigin: "top left" }}>
        {avatar}
      </div>
    </div>
  );
}
