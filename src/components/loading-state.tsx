"use client";

import { useState, useEffect } from "react";

const STAGES = [
  { delay: 0, message: "Reviewing the evidence..." },
  { delay: 4000, message: "Questioning the witnesses..." },
  { delay: 8000, message: "The court is deliberating..." },
  { delay: 14000, message: "Writing the verdict..." },
  { delay: 20000, message: "Almost there, counselor..." },
];

// K=black S=skin W=white/wig G=gray/wig D=blue(eyes) B=brown(gavel) Y=gold M=mouth T=table R=darktable C=collar
const JUDGE_FRAMES = [
  // Frame 0: gavel raised
  [
    "...........BBB..............",
    "...........BYB..............",
    "...........BBB..............",
    "............B...............",
    "............B...............",
    "............S...............",
    ".......WWGGWWWGGWW..........",
    "......WGGWGGWGGWGGW.........",
    "......WGGWGGWGGWGGW.........",
    ".....WGGWGGWGGWGGWGW........",
    ".....WGGSSSSSSSSGWGW........",
    ".....WGSSSSSSSSSSGW.........",
    "......WSSSDDSDDSSW..........",
    "......WSSSSSSSSSW...........",
    ".......SSSSMMSSS............",
    ".......SSSSSSSS.............",
    "........KCCCCCK.............",
    ".......KKCCCCKKK............",
    ".......KKKKKKKKKK...........",
    "......SKKKKKKKKKK...........",
    "......SKKKKKKKKKK...........",
    "TTTTTTTKKKKKKKKKKTTTTTTTTTT.",
    "TRRRRRTKKKKKKKKKKTRRRRRRRRT.",
    "TRRRRRTKKKKKKKKKKTRRRRRRRRT.",
    "TRRRRRTTTTTTTTTTTTRRRRRRRT..",
    "TRRRRRRRRRRRRRRRRRRRRRRRT...",
    "TTTTTTTTTTTTTTTTTTTTTTTTT...",
    ".....TT...........TT........",
    ".....TT...........TT........",
    ".....TT...........TT........",
  ],
  // Frame 1: gavel slamming table
  [
    "............................",
    "............................",
    "............................",
    "............................",
    "............................",
    "............................",
    ".......WWGGWWWGGWW..........",
    "......WGGWGGWGGWGGW.........",
    "......WGGWGGWGGWGGW.........",
    ".....WGGWGGWGGWGGWGW........",
    ".....WGGSSSSSSSSGWGW........",
    ".....WGSSSSSSSSSSGW.........",
    "......WSSSDDSDDSSW..........",
    "......WSSSSSSSSSW...........",
    ".......SSSSMMSSS............",
    ".......SSSSSSSS.............",
    "........KCCCCCK.............",
    ".......KKCCCCKKK............",
    ".......KKKKKKKKKK...........",
    ".......KKKKKKKKKK...........",
    "..BBBSSKKKKKKKKKK...........",
    "..BYSSKKKKKKKKKKK...........",
    "TTTTTTTKKKKKKKKKKTTTTTTTTTT.",
    "TRRRRRTKKKKKKKKKKTRRRRRRRRT.",
    "TRRRRRTKKKKKKKKKKTRRRRRRRRT.",
    "TRRRRRTTTTTTTTTTTTRRRRRRRT..",
    "TRRRRRRRRRRRRRRRRRRRRRRRT...",
    "TTTTTTTTTTTTTTTTTTTTTTTTT...",
    ".....TT...........TT........",
    ".....TT...........TT........",
    ".....TT...........TT........",
  ],
];

const COLOR_MAP: Record<string, string> = {
  ".": "transparent",
  K: "#1a1a1a",
  S: "#d4a574",
  W: "#e8e4df",
  G: "#b0aba5",
  D: "#2d4a6f",
  B: "#7a5c14",
  Y: "#c49a1a",
  M: "#c47a6a",
  T: "#6b4423",
  R: "#3d2510",
  C: "#d4d4d4",
};

const PX = 5;

function PixelJudge({ frame }: { frame: number }) {
  const rows = JUDGE_FRAMES[frame];
  const width = Math.max(...rows.map((r) => r.length));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${width}, ${PX}px)`,
        gridAutoRows: `${PX}px`,
        imageRendering: "pixelated",
      }}
    >
      {rows.flatMap((row, y) =>
        Array.from({ length: width }).map((_, x) => {
          const char = row[x] ?? ".";
          const color = COLOR_MAP[char] ?? "transparent";
          return (
            <div
              key={`${y}-${x}`}
              style={{
                width: PX,
                height: PX,
                backgroundColor: color,
              }}
            />
          );
        })
      )}
    </div>
  );
}

export default function LoadingState() {
  const [stageIndex, setStageIndex] = useState(0);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    STAGES.forEach((stage, i) => {
      if (i === 0) return;
      timers.push(setTimeout(() => setStageIndex(i), stage.delay));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f === 0 ? 1 : 0));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="relative">
        <PixelJudge frame={frame} />
        {frame === 1 && (
          <>
            <div className="absolute animate-ping" style={{ bottom: 48, left: 10, color: "#f59e0b", fontSize: 14 }}>✦</div>
            <div className="absolute animate-ping" style={{ bottom: 55, left: 20, color: "#f59e0b", fontSize: 10, animationDelay: "100ms" }}>✦</div>
            <div className="absolute animate-ping" style={{ bottom: 42, left: 4, color: "#f59e0b", fontSize: 9, animationDelay: "200ms" }}>✦</div>
          </>
        )}
      </div>

      <div className="w-48 h-1.5 bg-surface-raised rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
        />
      </div>

      <p className="text-muted text-lg font-medium font-[family-name:var(--font-space-grotesk)]">
        {STAGES[stageIndex].message}
      </p>
    </div>
  );
}
