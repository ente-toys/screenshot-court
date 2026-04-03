"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { compressImage, isAcceptedType, type CompressedImage } from "@/lib/compress";

interface UploadZoneProps {
  onImageReady: (image: CompressedImage) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onImageReady, onError, disabled }: UploadZoneProps) {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState<CompressedImage | null>(null);

  const handleDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!isAcceptedType(file.type)) {
        onError("The court only accepts screenshots (PNG, JPEG, WebP).");
        return;
      }

      setProcessing(true);
      try {
        const compressed = await compressImage(file);
        setPreview(compressed);
        onImageReady(compressed);
      } catch {
        onError("Failed to process image. Try a different file.");
      } finally {
        setProcessing(false);
      }
    },
    [onImageReady, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled: disabled || processing,
  });

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center
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
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-muted text-sm">Processing evidence...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.previewUrl}
                alt="Screenshot preview"
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>
            <div className="flex gap-4 text-xs text-muted">
              <span>{preview.width} x {preview.height}</span>
              <span>{formatBytes(preview.compressedSize)}</span>
            </div>
            <p className="text-xs text-muted">
              Drop another screenshot to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-4xl opacity-60">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-foreground font-[family-name:var(--font-pixel)] text-xs">
                SUBMIT EVIDENCE
              </p>
              <p className="text-xs text-muted mt-2">
                Drop a screenshot here (PNG, JPEG, WebP)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
