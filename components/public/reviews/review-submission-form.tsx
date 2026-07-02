"use client";

import { useState } from "react";
import { Loader2, Send, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublicSiteShell } from "@/components/public/public-site-context";
import type { PublicLocale } from "@/lib/public/locale";
import {
  buildPublicReviewSubmissionPayload,
  createDefaultReviewSubmissionForm,
  getReviewSubmissionLabels,
  validateReviewSubmissionForm,
  type ReviewSubmissionFormErrors,
} from "@/lib/public/review-submission-content";

type ReviewSubmissionFormProps = {
  locale: PublicLocale;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

function RatingInput({
  value,
  onChange,
  disabled,
  labels,
  error,
}: {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
  labels: ReturnType<typeof getReviewSubmissionLabels>;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{labels.rating}</Label>
      <div
        className="flex flex-wrap items-center gap-2"
        role="radiogroup"
        aria-label={labels.rating}
      >
        {Array.from({ length: 5 }).map((_, index) => {
          const ratingValue = index + 1;
          const isSelected = value !== null && ratingValue <= value;

          return (
            <button
              key={ratingValue}
              type="button"
              disabled={disabled}
              role="radio"
              aria-checked={value === ratingValue}
              aria-label={labels.ratingLabel(ratingValue)}
              onClick={() => onChange(ratingValue)}
              className="rounded-md p-1 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--public-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Star
                className={`size-8 ${
                  isSelected
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          );
        })}
        <span className="text-muted-foreground text-sm">
          {value ? labels.ratingLabel(value) : labels.selectRating}
        </span>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function ReviewSubmissionForm({ locale }: ReviewSubmissionFormProps) {
  const shell = usePublicSiteShell();
  const labels = getReviewSubmissionLabels(locale);
  const phoneMode = shell.reviewSubmission.phoneMode;
  const formEnabled = shell.featureFlags.reviewsEnabled;
  const [form, setForm] = useState(createDefaultReviewSubmissionForm);
  const [errors, setErrors] = useState<ReviewSubmissionFormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formEnabled) {
      return;
    }

    setSubmitError(null);

    const nextErrors = validateReviewSubmissionForm(form, phoneMode, locale);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitState("submitting");

    try {
      const response = await fetch("/api/public/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPublicReviewSubmissionPayload(form, phoneMode),
        ),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? labels.errorBody);
      }

      const payload = (await response.json()) as {
        data?: { status?: string };
      };

      if (payload.data?.status !== "PENDING") {
        throw new Error(labels.errorBody);
      }

      setSubmitState("success");
      setForm(createDefaultReviewSubmissionForm());
      setErrors({});
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error ? error.message : labels.errorBody,
      );
    }
  }

  if (!formEnabled) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
        <p className="text-muted-foreground">{labels.formDisabled}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{labels.formTitle}</h2>
        <p className="text-muted-foreground text-sm">{labels.formDescription}</p>
      </div>

      {submitState === "success" ? (
        <div
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {labels.successMessage}
        </div>
      ) : null}

      {submitState === "error" ? (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          <p className="font-medium">{labels.errorTitle}</p>
          <p className="mt-1">{submitError ?? labels.errorBody}</p>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-customer-name">{labels.customerName}</Label>
          <Input
            id="review-customer-name"
            name="customerName"
            value={form.customerName}
            onChange={(event) => updateField("customerName", event.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.customerName)}
          />
          {errors.customerName ? (
            <p className="text-sm text-red-600">{errors.customerName}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="review-email">{labels.email}</Label>
          <Input
            id="review-email"
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
          />
          <p className="text-muted-foreground text-xs">{labels.emailHint}</p>
          {errors.email ? (
            <p className="text-sm text-red-600">{errors.email}</p>
          ) : null}
        </div>
      </div>

      {phoneMode !== "HIDDEN" ? (
        <div className="space-y-2">
          <Label htmlFor="review-phone">{labels.phone}</Label>
          <Input
            id="review-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
          />
          <p className="text-muted-foreground text-xs">
            {phoneMode === "REQUIRED" ? labels.required : labels.phoneHint}
          </p>
          {errors.phone ? (
            <p className="text-sm text-red-600">{errors.phone}</p>
          ) : null}
        </div>
      ) : null}

      <RatingInput
        value={form.rating}
        onChange={(rating) => updateField("rating", rating)}
        disabled={submitState === "submitting"}
        labels={labels}
        error={errors.rating}
      />

      <div className="space-y-2">
        <Label htmlFor="review-title">{labels.title}</Label>
        <Input
          id="review-title"
          name="title"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">{labels.comment}</Label>
        <Textarea
          id="review-comment"
          name="comment"
          rows={5}
          value={form.comment}
          onChange={(event) => updateField("comment", event.target.value)}
          aria-invalid={Boolean(errors.comment)}
        />
        {errors.comment ? (
          <p className="text-sm text-red-600">{errors.comment}</p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={submitState === "submitting"}
        className="bg-[var(--public-button)] text-white hover:opacity-90"
      >
        {submitState === "submitting" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
        {submitState === "submitting" ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
