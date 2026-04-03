import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { analyzeScreenshot } from "@/lib/openai";
import type { ErrorResponse } from "@/lib/schema";

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB raw upload limit

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
  // Rate limit
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const res = errorJson(
      "Easy, counselor. Wait a moment.",
      "RATE_LIMITED",
      429
    );
    res.headers.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
    return res;
  }

  // Parse multipart
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorJson(
      "The court only accepts screenshots (PNG, JPEG, WebP).",
      "INVALID_IMAGE",
      400
    );
  }

  const file = formData.get("image");
  if (!file || !(file instanceof Blob)) {
    return errorJson(
      "The court only accepts screenshots (PNG, JPEG, WebP).",
      "INVALID_IMAGE",
      400
    );
  }

  // Validate type
  if (!ACCEPTED_TYPES.has(file.type)) {
    return errorJson(
      "The court only accepts screenshots (PNG, JPEG, WebP).",
      "INVALID_IMAGE",
      400
    );
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return errorJson(
      "Evidence too heavy. Try a smaller screenshot.",
      "TOO_LARGE",
      413
    );
  }

  // Read file buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Call model
  try {
    const result = await analyzeScreenshot(buffer, file.type);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";

    if (message === "MODEL_FAILURE") {
      return errorJson(
        "The judge fell asleep. Try again.",
        "MODEL_FAILURE",
        504
      );
    }

    return errorJson(
      "The judge fell asleep. Try again.",
      "MODEL_FAILURE",
      500
    );
  }
}
