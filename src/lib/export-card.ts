"use client";

import html2canvas from "html2canvas";

async function captureElement(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;

  const canvas = await html2canvas(element, {
    scale: 1,
    width: 1080,
    height: 1080,
    useCORS: true,
    backgroundColor: "#0c0a09",
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export card"));
      },
      "image/png",
      1
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: "image/png" });

  if (
    typeof navigator.share === "function" &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch {
      // User cancelled or share failed — fall through to download
    }
  }

  downloadBlob(blob, filename);
}

/**
 * Render a React element into an off-screen container, capture it, then clean up.
 * The caller passes the off-screen container ref that already has the export-mode card mounted.
 */
export async function exportCard(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const blob = await captureElement(element);
  await shareOrDownload(blob, filename);
}
