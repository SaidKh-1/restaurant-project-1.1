"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePublicSiteShell } from "@/components/public/public-site-context";
import {
  buildContactMessagePayload,
  formatOpeningHourLine,
  getContactPageLabels,
  isValidEmail,
  isValidPhoneOrWhatsapp,
  resolveMapEmbedUrl,
  sortOpeningHours,
  type PreferredContactMethod,
} from "@/lib/public/contact-content";
import type { PublicLocale } from "@/lib/public/locale";

type ContactPageContentProps = {
  locale: PublicLocale;
};

type FormErrors = {
  name?: string;
  method?: string;
  contactValue?: string;
  message?: string;
};

type SubmitState = "idle" | "submitting" | "success" | "error";

const CONTACT_METHODS: PreferredContactMethod[] = [
  "whatsapp",
  "phone",
  "email",
];

export function ContactPageContent({ locale }: ContactPageContentProps) {
  const shell = usePublicSiteShell();
  const labels = getContactPageLabels(locale);
  const [name, setName] = useState("");
  const [method, setMethod] = useState<PreferredContactMethod | "">("");
  const [contactValue, setContactValue] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [formLoadedAt] = useState(() => new Date().toISOString());
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formEnabled = shell.featureFlags.messagesEnabled;
  const sortedHours = useMemo(
    () => sortOpeningHours(shell.openingHours),
    [shell.openingHours],
  );
  const mapEmbedUrl = resolveMapEmbedUrl(shell.googleMapsUrl);

  function getContactValueLabel(selectedMethod: PreferredContactMethod) {
    switch (selectedMethod) {
      case "whatsapp":
        return labels.whatsappNumber;
      case "phone":
        return labels.phoneNumber;
      case "email":
        return labels.emailAddress;
    }
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = labels.required;
    }

    if (!method) {
      nextErrors.method = labels.required;
    }

    if (method) {
      const trimmedValue = contactValue.trim();

      if (!trimmedValue) {
        nextErrors.contactValue = labels.required;
      } else if (method === "email" && !isValidEmail(trimmedValue)) {
        nextErrors.contactValue = labels.invalidEmail;
      } else if (
        (method === "whatsapp" || method === "phone") &&
        !isValidPhoneOrWhatsapp(trimmedValue)
      ) {
        nextErrors.contactValue = labels.invalidPhone;
      }
    }

    if (!message.trim()) {
      nextErrors.message = labels.required;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formEnabled || !method) {
      return;
    }

    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitState("submitting");

    try {
      const payload = buildContactMessagePayload({
        name,
        method,
        contactValue,
        subject,
        message,
        locale,
        spamGuard: {
          honeypot,
          formLoadedAt,
        },
      });

      const response = await fetch("/api/public/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: { message?: string };
        } | null;
        throw new Error(body?.error?.message ?? labels.errorBody);
      }

      setSubmitState("success");
      setName("");
      setMethod("");
      setContactValue("");
      setSubject("");
      setMessage("");
      setErrors({});
    } catch (error) {
      setSubmitState("error");
      setSubmitError(
        error instanceof Error ? error.message : labels.errorBody,
      );
    }
  }

  function handleMethodChange(nextMethod: PreferredContactMethod) {
    setMethod(nextMethod);
    setContactValue("");
    setErrors((current) => ({
      ...current,
      method: undefined,
      contactValue: undefined,
    }));
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

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{labels.infoTitle}</h2>
            <p className="text-muted-foreground text-sm">{shell.restaurantName}</p>
          </div>

          <dl className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <div>
              <dt className="text-muted-foreground text-sm">{labels.restaurant}</dt>
              <dd className="mt-1 font-medium">{shell.restaurantName}</dd>
            </div>

            {shell.address ? (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin className="size-4 shrink-0" />
                  {labels.address}
                </dt>
                <dd className="mt-1 leading-7">{shell.address}</dd>
              </div>
            ) : null}

            {shell.contact.phone ? (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Phone className="size-4 shrink-0" />
                  {labels.phone}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${shell.contact.phone}`}
                    className="font-medium text-[var(--public-primary)] hover:underline"
                    dir="ltr"
                  >
                    {shell.contact.phone}
                  </a>
                </dd>
              </div>
            ) : null}

            {shell.whatsapp.enabled && shell.whatsapp.number ? (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MessageCircle className="size-4 shrink-0" />
                  {labels.whatsapp}
                </dt>
                <dd className="mt-1">
                  {shell.whatsapp.href ? (
                    <a
                      href={shell.whatsapp.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--public-primary)] hover:underline"
                      dir="ltr"
                    >
                      {shell.whatsapp.number}
                    </a>
                  ) : (
                    <span dir="ltr" className="font-medium">
                      {shell.whatsapp.number}
                    </span>
                  )}
                </dd>
              </div>
            ) : null}

            {shell.contact.email ? (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="size-4 shrink-0" />
                  {labels.email}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${shell.contact.email}`}
                    className="font-medium text-[var(--public-primary)] hover:underline"
                    dir="ltr"
                  >
                    {shell.contact.email}
                  </a>
                </dd>
              </div>
            ) : null}

            {sortedHours.length > 0 ? (
              <div>
                <dt className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Clock className="size-4 shrink-0" />
                  {labels.hours}
                </dt>
                <dd className="mt-2 space-y-1 text-sm">
                  {sortedHours.map((hour) => (
                    <p key={hour.dayOfWeek}>
                      {formatOpeningHourLine(locale, hour)}
                    </p>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>

          {shell.googleMapsUrl ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{labels.map}</h3>
              {mapEmbedUrl ? (
                <div className="overflow-hidden rounded-2xl border bg-muted shadow-sm">
                  <iframe
                    title={labels.map}
                    src={mapEmbedUrl}
                    className="aspect-[16/10] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
                  <MapPin className="text-muted-foreground mx-auto mb-3 size-8" />
                  <Button asChild variant="outline">
                    <a
                      href={shell.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {labels.viewMap}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ) : null}

          {shell.socialLinks.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{labels.social}</h3>
              <div className="flex flex-wrap gap-2">
                {shell.socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--public-primary)] hover:text-[var(--public-primary)]"
                  >
                    {link.label ?? link.platform}
                  </a>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {shell.whatsapp.href ? (
              <Button asChild className="bg-[var(--public-button)] text-white hover:opacity-90">
                <a
                  href={shell.whatsapp.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="size-4" />
                  {labels.openWhatsapp}
                </a>
              </Button>
            ) : null}
            {shell.contact.phone ? (
              <Button asChild variant="outline">
                <a href={`tel:${shell.contact.phone}`}>
                  <Phone className="size-4" />
                  {labels.callUs}
                </a>
              </Button>
            ) : null}
            {shell.contact.email ? (
              <Button asChild variant="outline">
                <a href={`mailto:${shell.contact.email}`}>
                  <Mail className="size-4" />
                  {labels.sendEmail}
                </a>
              </Button>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">{labels.formTitle}</h2>

          {!formEnabled ? (
            <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center">
              <p className="text-muted-foreground">{labels.formDisabled}</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
              noValidate
            >
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

              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-honeypot">Leave blank</label>
                <input
                  id="contact-honeypot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(event) => setHoneypot(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-name">{labels.name}</Label>
                <Input
                  id="contact-name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                />
                {errors.name ? (
                  <p id="contact-name-error" className="text-sm text-red-600">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium">{labels.preferredMethod}</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {CONTACT_METHODS.map((option) => {
                    const optionId = `contact-method-${option}`;
                    const optionLabel =
                      option === "whatsapp"
                        ? labels.methodWhatsapp
                        : option === "phone"
                          ? labels.methodPhone
                          : labels.methodEmail;

                    return (
                      <label
                        key={option}
                        htmlFor={optionId}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition-colors ${
                          method === option
                            ? "border-[var(--public-primary)] bg-[var(--public-primary)]/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <input
                          id={optionId}
                          type="radio"
                          name="preferredMethod"
                          value={option}
                          checked={method === option}
                          onChange={() => handleMethodChange(option)}
                          className="accent-[var(--public-primary)]"
                        />
                        {optionLabel}
                      </label>
                    );
                  })}
                </div>
                {errors.method ? (
                  <p className="text-sm text-red-600">{errors.method}</p>
                ) : null}
              </fieldset>

              {method ? (
                <div className="space-y-2">
                  <Label htmlFor="contact-value">
                    {getContactValueLabel(method)}
                  </Label>
                  <Input
                    id="contact-value"
                    name="contactValue"
                    type={method === "email" ? "email" : "tel"}
                    inputMode={method === "email" ? "email" : "tel"}
                    value={contactValue}
                    onChange={(event) => setContactValue(event.target.value)}
                    autoComplete={
                      method === "email"
                        ? "email"
                        : method === "whatsapp"
                          ? "tel"
                          : "tel"
                    }
                    dir="ltr"
                    aria-invalid={Boolean(errors.contactValue)}
                    aria-describedby={
                      errors.contactValue ? "contact-value-error" : undefined
                    }
                  />
                  {errors.contactValue ? (
                    <p id="contact-value-error" className="text-sm text-red-600">
                      {errors.contactValue}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="contact-subject">{labels.subject}</Label>
                <Input
                  id="contact-subject"
                  name="subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message">{labels.message}</Label>
                <Textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "contact-message-error" : undefined
                  }
                />
                {errors.message ? (
                  <p id="contact-message-error" className="text-sm text-red-600">
                    {errors.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={submitState === "submitting"}
                className="w-full bg-[var(--public-button)] text-white hover:opacity-90 sm:w-auto"
              >
                <Send className="size-4" />
                {submitState === "submitting" ? labels.submitting : labels.submit}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
