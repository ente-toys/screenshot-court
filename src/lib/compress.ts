"use client";

import imageCompression from "browser-image-compression";

const MAX_SIZE_MB = 4;
const MAX_WIDTH = 2048;

/** Composite a PNG/WebP with alpha onto a white background, returning a canvas */
function compositeAlpha(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/jpeg",
      quality
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export type CompressedImage = {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function isAcceptedType(type: string): boolean {
  return ACCEPTED_TYPES.includes(type);
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const originalSize = file.size;

  const needsAlphaComposite =
    file.type === "image/png" || file.type === "image/webp";

  let processedFile: File;

  if (needsAlphaComposite) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const canvas = compositeAlpha(img);
      const blob = await canvasToBlob(canvas, 0.9);
      processedFile = new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
        type: "image/jpeg",
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    processedFile = file;
  }

  const compressed = await imageCompression(processedFile, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  const compressedFile = new File(
    [compressed],
    file.name.replace(/\.\w+$/, ".jpg"),
    { type: "image/jpeg" }
  );

  const previewUrl = URL.createObjectURL(compressedFile);

  const img = await loadImage(previewUrl);

  return {
    file: compressedFile,
    previewUrl,
    width: img.naturalWidth,
    height: img.naturalHeight,
    originalSize,
    compressedSize: compressedFile.size,
  };
}
