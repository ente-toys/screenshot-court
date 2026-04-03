"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { compressImage, isAcceptedType, type CompressedImage } from "@/lib/compress";

interface UploadZoneProps {
  onImagesReady: (images: CompressedImage[]) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onImagesReady, onError, disabled }: UploadZoneProps) {
  const [processing, setProcessing] = useState(false);
  const [previews, setPreviews] = useState<CompressedImage[]>([]);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((f) => isAcceptedType(f.type));
      if (validFiles.length === 0) {
        onError("The court only accepts screenshots (PNG, JPEG, WebP).");
        return;
      }

      setProcessing(true);
      try {
        const compressed = await Promise.all(validFiles.map((f) => compressImage(f)));
        setPreviews((prev) => [...prev, ...compressed]);
      } catch {
        onError("Failed to process image. Try a different file.");
      } finally {
        setProcessing(false);
      }
    },
    [onImagesReady, onError]
  );

  const handleRemove = useCallback(
    (index: number) => {
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    []
  );

  useEffect(() => {
    if (previews.length > 0) onImagesReady(previews);
  }, [previews, onImagesReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    multiple: true,
    disabled: disabled || processing,
  });

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-bold text-muted font-[family-name:var(--font-pixel)] uppercase tracking-wider">
            Evidence ({previews.length} screenshot{previews.length > 1 ? "s" : ""})
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {previews.map((preview, i) => (
              <div key={i} className="relative shrink-0 w-28 rounded-lg overflow-hidden bg-surface border border-surface-overlay group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview.previewUrl}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-20 object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(i); }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-guilty text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  x
                </button>
                <div className="px-1.5 py-1 text-[9px] text-muted text-center">
                  {formatBytes(preview.compressedSize)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center
          transition-all duration-200 cursor-pointer
          font-[family-name:var(--font-pixel-body)]
          ${isDragActive
            ? "border-accent bg-accent/5 scale-[1.02]"
            : "border-wood-light hover:border-accent hover:bg-surface/50"
          }
          ${disabled || processing ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input {...getInputProps()} />

        {processing ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Processing evidence...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="text-3xl opacity-60">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <p className="font-bold text-foreground font-[family-name:var(--font-pixel)] text-xs">
              {previews.length > 0 ? "ADD MORE" : "SUBMIT EVIDENCE"}
            </p>
            <p className="text-xs text-muted">
              {previews.length > 0
                ? "Drop more screenshots to add to the case"
                : "Drop one or more screenshots (PNG, JPEG, WebP)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
