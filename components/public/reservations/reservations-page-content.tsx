"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Phone, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublicSiteShell } from "@/components/public/public-site-context";
import type { PublicLocale } from "@/lib/public/locale";
import {
  buildPublicReservationPayload,
  createDefaultReservationForm,
  getMinReservationDate,
  getReservationsPageLabels,
  validateReservationForm,
  type ReservationFormErrors,
} from "@/lib/public/reservations-content";

type ReservationsPageContentProps = {
  locale: PublicLocale;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

export function ReservationsPageContent({
  locale,
}: ReservationsPageContentProps) {
  const shell = usePublicSiteShell();
  const labels = getReservationsPageLabels(locale);
  const reservationsEnabled = shell.featureFlags.reservationsEnabled;
  const [form, setForm] = useState(createDefaultReservationForm);
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => new Date().toISOString());
  const [errors, setErrors] = useState<ReservationFormErrors>({});
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

    if (!reservationsEnabled) {
      return;
    }

    setSubmitError(null);

    const nextErrors = validateReservationForm(form, locale);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitState("submitting");

    try {
      const response = await fetch("/api/public/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          buildPublicReservationPayload(form, {
            honeypot,
            formLoadedAt,
          }),
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
      setForm(createDefaultReservationForm());
      setErrors({});
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error ? error.message : labels.errorBody,
      );
    }
  }

  return (
    <div className="pb-16">
      <section className="border-b bg-[var(--public-secondary)]/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-medium text-[var(--public-primary)]">
            {labels.subtitle}
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {labels.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {!reservationsEnabled ? (
          <div className="space-y-6 rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{labels.disabledTitle}</h2>
              <p className="text-muted-foreground">{labels.disabledBody}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {shell.whatsapp.enabled && shell.whatsapp.href ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-[var(--public-button)] text-white hover:opacity-90"
                >
                  <Link
                    href={shell.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    {labels.whatsappCta}
                  </Link>
                </Button>
              ) : null}

              {shell.reservation.phone ? (
                <Button asChild size="lg" variant="outline">
                  <Link href={shell.reservation.phone}>
                    <Phone className="size-4" />
                    {labels.callCta}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
            noValidate
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{labels.formTitle}</h2>
              <p className="text-muted-foreground text-sm">
                {labels.formDescription}
              </p>
            </div>

            {submitState === "success" ? (
              <div
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                role="status"
              >
                <p className="font-medium">{labels.successTitle}</p>
                <p className="mt-1">{labels.successBody}</p>
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

            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
              aria-hidden="true"
            >
              <label htmlFor="reservation-honeypot">Leave blank</label>
              <input
                id="reservation-honeypot"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-name">{labels.name}</Label>
              <Input
                id="reservation-name"
                name="name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? (
                <p className="text-sm text-red-600">{errors.name}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-phone">{labels.phone}</Label>
              <Input
                id="reservation-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                dir="ltr"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
              />
              <p className="text-muted-foreground text-xs">{labels.phoneHint}</p>
              {errors.phone ? (
                <p className="text-sm text-red-600">{errors.phone}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reservation-date">{labels.date}</Label>
                <Input
                  id="reservation-date"
                  name="reservationDate"
                  type="date"
                  dir="ltr"
                  min={getMinReservationDate()}
                  value={form.reservationDate}
                  onChange={(event) =>
                    updateField("reservationDate", event.target.value)
                  }
                  aria-invalid={Boolean(errors.reservationDate)}
                />
                {errors.reservationDate ? (
                  <p className="text-sm text-red-600">{errors.reservationDate}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reservation-time">{labels.time}</Label>
                <Input
                  id="reservation-time"
                  name="reservationTime"
                  type="time"
                  dir="ltr"
                  value={form.reservationTime}
                  onChange={(event) =>
                    updateField("reservationTime", event.target.value)
                  }
                  aria-invalid={Boolean(errors.reservationTime)}
                />
                {errors.reservationTime ? (
                  <p className="text-sm text-red-600">{errors.reservationTime}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-guests">{labels.guests}</Label>
              <Input
                id="reservation-guests"
                name="guests"
                type="number"
                min={1}
                max={50}
                inputMode="numeric"
                value={form.guests}
                onChange={(event) => updateField("guests", event.target.value)}
                aria-invalid={Boolean(errors.guests)}
              />
              {errors.guests ? (
                <p className="text-sm text-red-600">{errors.guests}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-notes">{labels.notes}</Label>
              <Textarea
                id="reservation-notes"
                name="notes"
                rows={4}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={submitState === "submitting"}
              className="w-full bg-[var(--public-button)] text-white hover:opacity-90 sm:w-auto"
            >
              {submitState === "submitting" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {submitState === "submitting" ? labels.submitting : labels.submit}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
