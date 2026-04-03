export type AppState = "idle" | "previewing" | "analyzing" | "result" | "error";

export type ErrorCode =
  | "INVALID_IMAGE"
  | "TOO_LARGE"
  | "RATE_LIMITED"
  | "MODEL_FAILURE";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  INVALID_IMAGE: "The court only accepts screenshots (PNG, JPEG, WebP).",
  TOO_LARGE: "Evidence too heavy. Try a smaller screenshot.",
  RATE_LIMITED: "Easy, counselor. Wait a moment.",
  MODEL_FAILURE: "The judge fell asleep. Try again.",
};
