/**
 * Shared spam-protection envelope for public form submissions.
 * Honeypot is enforced now; captcha and rate limits can plug in later.
 */
export type SpamGuardInput = {
  honeypot?: string;
  formLoadedAt?: string;
  captchaToken?: string;
};

export type SpamGuardResult =
  | { allowed: true }
  | { allowed: false; reason: "honeypot" | "captcha" | "rate_limit" };

export function evaluateSpamGuard(input?: SpamGuardInput): SpamGuardResult {
  if (!input) {
    return { allowed: true };
  }

  if (input.honeypot && input.honeypot.trim().length > 0) {
    return { allowed: false, reason: "honeypot" };
  }

  // Reserved for future captcha verification.
  if (input.captchaToken === "invalid") {
    return { allowed: false, reason: "captcha" };
  }

  // Reserved for future minimum form fill duration checks.
  if (input.formLoadedAt) {
    const loadedAt = Date.parse(input.formLoadedAt);

    if (Number.isFinite(loadedAt)) {
      const elapsedMs = Date.now() - loadedAt;

      if (elapsedMs < 0) {
        return { allowed: false, reason: "rate_limit" };
      }
    }
  }

  return { allowed: true };
}

export function buildSpamRejectedPublicResponse() {
  return {
    id: null,
    status: "accepted" as const,
    message: "Message submitted successfully.",
  };
}
