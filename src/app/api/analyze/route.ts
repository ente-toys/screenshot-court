import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeScreenshots } from "@/lib/openai";
import type { ErrorResponse } from "@/lib/schema";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 10;

function errorJson(error: string, code: string, status: number) {
  return NextResponse.json({ error, code } as ErrorResponse, { status });
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const res = errorJson("Easy, counselor. Wait a moment.", "RATE_LIMITED", 429);
    res.headers.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
    return res;
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorJson("The court only accepts screenshots (PNG, JPEG, WebP).", "INVALID_IMAGE", 400);
  }

  // Collect all images from formdata
  const images: { buffer: Buffer; mimeType: string }[] = [];
  const entries = formData.getAll("images");

  // Also support single "image" field for backwards compat
  if (entries.length === 0) {
    const single = formData.get("image");
    if (single && single instanceof Blob) entries.push(single);
  }

  for (const entry of entries) {
    if (!(entry instanceof Blob)) continue;

    if (!ACCEPTED_TYPES.has(entry.type)) {
      return errorJson("The court only accepts screenshots (PNG, JPEG, WebP).", "INVALID_IMAGE", 400);
    }
    if (entry.size > MAX_FILE_SIZE) {
      return errorJson("Evidence too heavy. Try a smaller screenshot.", "TOO_LARGE", 413);
    }

    const arrayBuffer = await entry.arrayBuffer();
    images.push({ buffer: Buffer.from(arrayBuffer), mimeType: entry.type });
  }

  if (images.length === 0) {
    return errorJson("The court only accepts screenshots (PNG, JPEG, WebP).", "INVALID_IMAGE", 400);
  }

  if (images.length > MAX_IMAGES) {
    return errorJson(`Too many screenshots. Max ${MAX_IMAGES} per case.`, "TOO_LARGE", 413);
  }

  try {
    const result = await analyzeScreenshots(images);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message === "MODEL_FAILURE") {
      return errorJson("The judge fell asleep. Try again.", "MODEL_FAILURE", 504);
    }
    return errorJson("The judge fell asleep. Try again.", "MODEL_FAILURE", 500);
  }
}
