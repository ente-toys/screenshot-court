"use client";

import { useState, useRef, useCallback } from "react";
import type { AppState, ErrorCode } from "@/lib/state";
import type { CourtResult } from "@/lib/schema";
import { playTripleBang, playDramaticReveal, playGuiltyBuzz, playAcquittalChime } from "@/lib/sounds";
import type { CompressedImage } from "@/lib/compress";
import UploadZone from "@/components/upload-zone";
import LoadingState from "@/components/loading-state";
import ErrorState from "@/components/error-state";
import VerdictCard from "@/components/result-card-verdict";
import NextMoveCard from "@/components/result-card-next-move";
import StyleSwitcher from "@/components/style-switcher";

async function captureElement(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#0c0a09",
    ignoreElements: (el) => el.tagName === "AUDIO",
  });
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), "image/png")
  );
}

async function downloadBlob(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });
  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch { /* cancelled */ }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [result, setResult] = useState<CourtResult | null>(null);
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);
  const [activeVariant, setActiveVariant] = useState<string | null>(null);
  const [lastImages, setLastImages] = useState<CompressedImage[]>([]);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const requestIdRef = useRef(0);
  const verdictCardRef = useRef<HTMLDivElement>(null);
  const nextMoveCardRef = useRef<HTMLDivElement>(null);

  const handleNewCase = useCallback(() => {
    requestIdRef.current += 1;
    setAppState("idle");
    setResult(null);
    setErrorCode(null);
    setActiveVariant(null);
    setLastImages([]);
    setExportError(null);
    setCopied(false);
  }, []);

  const submitAnalysis = useCallback(async (images: CompressedImage[]) => {
    requestIdRef.current += 1;
    const thisRequestId = requestIdRef.current;

    setAppState("analyzing");
    setResult(null);
    setErrorCode(null);
    setExportError(null);

    const formData = new FormData();
    for (const img of images) {
      formData.append("images", img.file);
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (!response.ok) {
        const err = await response.json();
        setErrorCode(err.code as ErrorCode);
        setAppState("error");
        return;
      }

      const data: CourtResult = await response.json();
      setResult(data);
      setAppState("result");

      // Sound effects on verdict
      playDramaticReveal();
      setTimeout(() => {
        const hasGuilty = data.participants.some((p) => p.verdict === "GUILTY");
        if (hasGuilty) playGuiltyBuzz();
        else playAcquittalChime();
      }, 800);
    } catch {
      if (thisRequestId !== requestIdRef.current) return;
      setErrorCode("MODEL_FAILURE");
      setAppState("error");
    }
  }, []);

  const handleImagesReady = useCallback((images: CompressedImage[]) => {
    setLastImages(images);
    setAppState("previewing");
  }, []);

  const handleUploadError = useCallback((message: string) => {
    void message;
    setErrorCode("INVALID_IMAGE");
    setAppState("error");
  }, []);

  const handleSendToCourt = useCallback(() => {
    if (lastImages.length > 0) {
      playTripleBang();
      submitAnalysis(lastImages);
    }
  }, [lastImages, submitAnalysis]);

  const handleRetry = useCallback(() => {
    if (lastImages.length > 0) submitAnalysis(lastImages);
  }, [lastImages, submitAnalysis]);

  const handleExportVerdict = useCallback(async () => {
    if (!verdictCardRef.current) return;
    try {
      setExportError(null);
      const blob = await captureElement(verdictCardRef.current);
      await downloadBlob(blob, "verdict-card.png");
    } catch {
      setExportError("Export failed \u2014 try long-press save instead.");
    }
  }, []);

  const handleExportNextMove = useCallback(async () => {
    if (!nextMoveCardRef.current) return;
    try {
      setExportError(null);
      const blob = await captureElement(nextMoveCardRef.current);
      await downloadBlob(blob, "next-move-card.png");
    } catch (err) {
      console.error("Export error:", err);
      setExportError("Export failed \u2014 try long-press save instead.");
    }
  }, []);

  const handleShareVerdict = useCallback(async () => {
    if (!verdictCardRef.current) return;
    try {
      setExportError(null);
      const blob = await captureElement(verdictCardRef.current);
      const file = new File([blob], "screenshot-court-verdict.png", { type: "image/png" });

      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        const guiltyNames = result?.participants
          .filter((p) => p.verdict === "GUILTY")
          .map((p) => p.name)
          .join(", ");
        await navigator.share({
          text: guiltyNames
            ? `${guiltyNames} found GUILTY by Screenshot Court! ${result?.one_liner}`
            : `Screenshot Court has spoken! ${result?.one_liner}`,
          files: [file],
        });
      } else {
        const lines = result?.participants.map(
          (p) => `${p.verdict === "GUILTY" ? "\u274C" : "\u2705"} ${p.name}: ${p.roast} ${p.sentence}`
        );
        const text = `Screenshot Court Verdict\n\n${result?.one_liner}\n\n${lines?.join("\n")}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setExportError("Share failed \u2014 try downloading instead.");
    }
  }, [result]);

  const handleCopyReply = useCallback(async () => {
    if (!result) return;
    const text =
      activeVariant && activeVariant in result.style_variants
        ? result.style_variants[activeVariant as keyof typeof result.style_variants].reply_text
        : result.reply_text;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, [result, activeVariant]);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      {/* Courtroom header */}
      <header className="text-center mb-8 sm:mb-12 relative">
        {/* Pixel gavel smash */}
        <div className="flex justify-center mb-4">
          <svg width="72" height="64" viewBox="0 0 72 64" className="overflow-visible">
            {/* Sound block */}
            <rect x="-8" y="54" width="22" height="7" rx="3" fill="#6b3020" />
            <rect x="-6" y="55" width="18" height="5" rx="2" fill="#8b4030" />

            {/* Gavel — pivots from bottom-right end of handle */}
            <g style={{ transformOrigin: "58px 48px" }} className="animate-[gavelSmash_0.8s_ease-in-out_infinite]">
              {/* Handle — diagonal bottom-right to top-left */}
              <line x1="58" y1="48" x2="22" y2="12" stroke="#5c3a1e" strokeWidth="5" strokeLinecap="round" />
              <line x1="57" y1="47" x2="23" y2="13" stroke="#7a4e28" strokeWidth="3" strokeLinecap="round" />

              {/* Head — perpendicular to handle at top-left end */}
              <g transform="rotate(-45, 20, 10)">
                {/* Brown end caps */}
                <rect x="6" y="2" width="8" height="18" rx="2" fill="#6b3020" />
                <rect x="26" y="2" width="8" height="18" rx="2" fill="#6b3020" />
                {/* Gold center band */}
                <rect x="13" y="2" width="14" height="18" rx="1" fill="#c49a1a" />
                <rect x="14" y="4" width="12" height="14" rx="1" fill="#dab030" />
              </g>
            </g>

            {/* Impact sparks — aligned with sound block */}
            <g className="animate-[sparkFlash_0.8s_ease-in-out_infinite]">
              <rect x="-12" y="51" width="3" height="3" fill="#f59e0b" />
              <rect x="18" y="51" width="3" height="3" fill="#f59e0b" />
              <rect x="-16" y="48" width="2" height="2" fill="#f59e0b" />
              <rect x="22" y="48" width="2" height="2" fill="#f59e0b" />
              <rect x="-10" y="47" width="2" height="2" fill="#fbbf24" />
              <rect x="16" y="47" width="2" height="2" fill="#fbbf24" />
            </g>
          </svg>
        </div>

        <div className="animate-[titleBounce_2s_ease-in-out_infinite]">
          <h1 className="font-[family-name:var(--font-pixel)] text-xl sm:text-3xl tracking-wide text-accent drop-shadow-[0_2px_0_#7a5c14]">
            SCREENSHOT COURT
          </h1>
        </div>
        <style>{`
          @keyframes titleBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes gavelSmash {
            0% { transform: rotate(-40deg); }
            35% { transform: rotate(-40deg); }
            50% { transform: rotate(0deg); }
            55% { transform: rotate(-3deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(-40deg); }
          }
          @keyframes sparkFlash {
            0%, 48% { opacity: 0; transform: scale(0); }
            49%, 50% { opacity: 1; transform: scale(1.4); }
            52% { opacity: 1; transform: scale(1); }
            58% { opacity: 0.5; transform: scale(0.8); }
            62%, 100% { opacity: 0; transform: scale(0); }
          }
        `}</style>
        <div className="w-48 h-1 bg-wood-light mx-auto mt-4 rounded-full" />
        <p className="text-muted mt-4 text-xs sm:text-sm max-w-md mx-auto font-[family-name:var(--font-pixel-body)]">
          Submit your evidence. The court will decide.
        </p>
      </header>

      {/* Upload */}
      {(appState === "idle" || appState === "previewing") && (
        <div className="w-full max-w-lg">
          <UploadZone
            onImagesReady={handleImagesReady}
            onError={handleUploadError}
          />
          {appState === "previewing" && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleSendToCourt}
                className="px-8 py-4 bg-accent text-background font-bold text-sm rounded-xl
                           hover:opacity-90 active:scale-[0.97] transition-all
                           font-[family-name:var(--font-pixel)] border-b-4 border-[#7a5c14]
                           hover:border-b-2 hover:mt-[2px]"
              >
                SEND TO COURT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {appState === "analyzing" && <LoadingState />}

      {/* Error */}
      {appState === "error" && errorCode && (
        <ErrorState code={errorCode} onRetry={handleRetry} onNewCase={handleNewCase} />
      )}

      {/* Result */}
      {appState === "result" && result && (
        <div className="w-full max-w-xl flex flex-col items-center gap-6">
          {/* Voice Switcher */}
          <StyleSwitcher activeVariant={activeVariant} onSelect={setActiveVariant} />

          {/* Cards — captured directly for export */}
          <div className="w-full flex flex-col gap-6">
            <div ref={verdictCardRef}>
              <VerdictCard result={result} activeVariant={activeVariant} />
            </div>
            <div ref={nextMoveCardRef}>
              <NextMoveCard result={result} activeVariant={activeVariant} />
            </div>
          </div>

          {exportError && <p className="text-guilty text-sm">{exportError}</p>}

          {/* Primary action: Share */}
          <button
            onClick={handleShareVerdict}
            className="w-full max-w-xs px-6 py-4 bg-accent text-background font-bold text-xs rounded-xl
                       hover:opacity-90 active:scale-[0.97] transition-all
                       font-[family-name:var(--font-pixel)] flex items-center justify-center gap-3
                       border-b-4 border-[#7a5c14] hover:border-b-2 hover:mt-[2px]"
          >
            {copied ? "COPIED!" : "SHARE VERDICT"}
          </button>

          {/* Secondary actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleExportVerdict}
              className="px-4 py-3 bg-wood-dark text-foreground font-bold rounded-lg
                         hover:bg-wood-light active:scale-[0.97] transition-all text-[10px]
                         font-[family-name:var(--font-pixel)] border-b-3 border-[#1a0f04]"
            >
              SAVE VERDICT
            </button>
            <button
              onClick={handleExportNextMove}
              className="px-4 py-3 bg-wood-dark text-foreground font-bold rounded-lg
                         hover:bg-wood-light active:scale-[0.97] transition-all text-[10px]
                         font-[family-name:var(--font-pixel)] border-b-3 border-[#1a0f04]"
            >
              SAVE REPLY
            </button>
            <button
              onClick={handleCopyReply}
              className="px-4 py-3 bg-wood-dark text-foreground font-bold rounded-lg
                         hover:bg-wood-light active:scale-[0.97] transition-all text-[10px]
                         font-[family-name:var(--font-pixel)] border-b-3 border-[#1a0f04]"
            >
              {copied ? "COPIED!" : "COPY REPLY"}
            </button>
            <button
              onClick={handleNewCase}
              className="px-4 py-3 bg-accent text-background font-bold rounded-lg
                         hover:opacity-90 active:scale-[0.97] transition-all text-[10px]
                         font-[family-name:var(--font-pixel)] border-b-3 border-[#7a5c14]"
            >
              NEW CASE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
